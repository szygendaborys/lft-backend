import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { AbstractEntity } from '../../../shared/abstract.entity';
import { RIOT_API_POSITIONS } from '../../riotApi/riotApi.config';
import { LeagueUser } from '../../users/league-user.entity';
import { LeagueRoom } from '../league-room.entity';
import { LEAGUE_ROOM_APPLICATION_STATUS } from './league-room-applications.config';

const LEAGUE_ROOM_APPLICATION_USER_INDEX = 'idx_league_room_application_user';
const LEAGUE_ROOM_APPLICATION_ROOM_INDEX = 'idx_league_room_application_room';

@Entity()
export class LeagueRoomApplication extends AbstractEntity {
  @Column({
    enum: LEAGUE_ROOM_APPLICATION_STATUS,
    nullable: false,
  })
  status: LEAGUE_ROOM_APPLICATION_STATUS;

  @Column({
    enum: RIOT_API_POSITIONS,
    nullable: false,
  })
  appliedForPosition: RIOT_API_POSITIONS;

  @Column({
    type: 'boolean',
    nullable: false,
    default: false,
  })
  isOwner: boolean;

  @ManyToOne(() => LeagueUser, (lu) => lu.leagueRoomApplications, {
    eager: true,
    nullable: false,
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn()
  @Index(LEAGUE_ROOM_APPLICATION_USER_INDEX)
  leagueUser: LeagueUser;

  @ManyToOne(() => LeagueRoom, (lg) => lg.applications, {
    eager: true,
    nullable: false,
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn()
  @Index(LEAGUE_ROOM_APPLICATION_ROOM_INDEX)
  room: LeagueRoom;

  constructor(partial: Partial<LeagueRoomApplication>) {
    super();
    Object.assign(this, partial);
  }

  approveApplication(): void {
    this.status = LEAGUE_ROOM_APPLICATION_STATUS.APPROVED;
    this.room.removeDemandedPosition(this.appliedForPosition);
  }

  rejectApplication(): void {
    this.status = LEAGUE_ROOM_APPLICATION_STATUS.REJECTED;
  }

  leave(): void {
    this.status = LEAGUE_ROOM_APPLICATION_STATUS.LEFT;
  }
}
