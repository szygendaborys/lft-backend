import { User } from './../../users/user.entity';
import { countReset } from 'console';
import { application } from 'express';
import { stat } from 'fs';
import { Entity, Column, Index, OneToMany } from 'typeorm';
import { v4 } from 'uuid';
import { AbstractEntity } from '../../shared/abstract.entity';
import {
  RIOT_API_REGIONS,
  RIOT_API_POSITIONS,
} from '../riotApi/riotApi.config';
import { LeagueUserNotFoundException } from '../users/exceptions/league-user-not-found.exception';
import { LeagueRoomApplicationNotFoundException } from './applications/league-room-application-not-found.exception';
import { LeagueRoomApplication } from './applications/league-room-application.entity';
import { LEAGUE_ROOM_APPLICATION_STATUS } from './applications/league-room-applications.config';
import { CreateLeagueRoomDto } from './dto/create-league-room.dto';
import { UpdateLeagueRoomDto } from './dto/update-league-room.dto';
import { InvalidLeagueRoomPositionException } from './invalid-league-room-position.exception';

const LEAGUE_ROOM_DATE_INDEX = 'idx_league_room_date';

@Entity()
export class LeagueRoom extends AbstractEntity {
  @Column({ type: 'varchar', length: 1500, nullable: true })
  description: string | null;

  @Column({ enum: RIOT_API_REGIONS })
  region: RIOT_API_REGIONS;

  @Column({ type: 'timestamp' })
  @Index(LEAGUE_ROOM_DATE_INDEX)
  date: Date;

  @Column({
    type: 'varchar',
    enum: RIOT_API_POSITIONS,
    name: 'demanded_positions',
    array: true,
  })
  demandedPositions: RIOT_API_POSITIONS[];

  @OneToMany(() => LeagueRoomApplication, (lra) => lra.room, {
    cascade: true,
  })
  applications: LeagueRoomApplication[];

  static create(createLeagueRoomDto: CreateLeagueRoomDto): LeagueRoom {
    return new LeagueRoom({
      id: v4(),
      applications: [],
      ...createLeagueRoomDto,
    });
  }

  constructor(partial: Partial<LeagueRoom>) {
    super();

    Object.assign(this, partial);
  }

  get currentPlayers(): number {
    return this.getApplicationsByStatus(LEAGUE_ROOM_APPLICATION_STATUS.APPROVED)
      .length;
  }

  get requiredPlayers(): number {
    return this.currentPlayers + this.demandedPositions.length;
  }

  addApplication(application: LeagueRoomApplication): void {
    this.applications.push(application);
  }

  leave(applicationId: string): void {
    const application = this.applications.find(
      (application) => application.id === applicationId,
    );

    if (!application) {
      throw new LeagueRoomApplicationNotFoundException();
    }

    application.leave();

    this.demandedPositions.push(application.appliedForPosition);
  }

  removeDemandedPosition(position: RIOT_API_POSITIONS): void {
    const filteredPositions = this.demandedPositions.filter(
      (demandedPosition) => demandedPosition !== position,
    );

    if (filteredPositions.length === this.demandedPositions.length) {
      throw new InvalidLeagueRoomPositionException();
    }

    this.demandedPositions = filteredPositions;
  }

  updateDetails({
    date,
    demandedPositions,
    description,
    ownerId,
  }: UpdateLeagueRoomDto): void {
    if (date) {
      this.date = new Date(date);
    }

    if (demandedPositions) {
      const countReport = this.generateApplicationCountReportByStatus(
        LEAGUE_ROOM_APPLICATION_STATUS.APPROVED,
      );

      demandedPositions.map((position) => {
        if (countReport.get(position) > 0) {
          throw new InvalidLeagueRoomPositionException();
        }
      });

      const applicationsToReject = this.getApplicationsByStatus(
        LEAGUE_ROOM_APPLICATION_STATUS.PENDING,
      ).filter(
        (application) =>
          !demandedPositions.includes(application.appliedForPosition),
      );

      applicationsToReject.map((application) =>
        application.rejectApplication(),
      );

      this.demandedPositions = demandedPositions;
    }

    if (description) {
      this.description = description;
    }

    if (ownerId) {
      this.setOwner(ownerId);
    }
  }

  getOwner(): User | undefined {
    return this.applications.find((application) => application.isOwner)
      ?.leagueUser?.userGames?.user;
  }

  private setOwner(ownerId: string): void {
    if (
      !this.applications.find(
        (application) => application.leagueUser.id === ownerId,
      )
    ) {
      throw new LeagueUserNotFoundException();
    }

    this.applications = this.applications.map((application) => {
      application.isOwner = false;

      if (application.leagueUser.id === ownerId) {
        application.isOwner = true;
      }

      return application;
    });
  }

  private generateApplicationCountReportByStatus(
    status: LEAGUE_ROOM_APPLICATION_STATUS,
  ): ReadonlyMap<RIOT_API_POSITIONS, number> {
    const filteredApplications = this.getApplicationsByStatus(status);

    const report = new Map<RIOT_API_POSITIONS, number>([
      [RIOT_API_POSITIONS.TOP, 0],
      [RIOT_API_POSITIONS.JUNGLE, 0],
      [RIOT_API_POSITIONS.MIDDLE, 0],
      [RIOT_API_POSITIONS.ADC, 0],
      [RIOT_API_POSITIONS.SUPPORT, 0],
    ]);

    filteredApplications.reduce((acc, application) => {
      const count = acc.get(application.appliedForPosition);

      acc.set(application.appliedForPosition, count + 1);

      return acc;
    }, report);

    return report;
  }

  getApplicationsByStatus(
    status: LEAGUE_ROOM_APPLICATION_STATUS,
  ): LeagueRoomApplication[] {
    return (
      this.applications?.filter(
        (application) => application.status === status,
      ) ?? []
    );
  }

  remove(): void {
    const pendingApplications = this.getApplicationsByStatus(
      LEAGUE_ROOM_APPLICATION_STATUS.PENDING,
    );
    const approvedApplications = this.getApplicationsByStatus(
      LEAGUE_ROOM_APPLICATION_STATUS.APPROVED,
    );

    pendingApplications.map((application) => application.rejectApplication());
    approvedApplications.map((application) => application.leave());

    this.deletedAt = new Date();
  }
}
