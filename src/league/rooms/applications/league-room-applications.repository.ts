import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LeagueUser } from '../../users/league-user.entity';
import { LeagueRoomApplication } from './league-room-application.entity';
import { LEAGUE_ROOM_APPLICATION_STATUS } from './league-room-applications.config';

@Injectable()
export class LeagueRoomApplicationsRepository {
  constructor(
    @InjectRepository(LeagueRoomApplication)
    private readonly repository: Repository<LeagueRoomApplication>,
  ) {}

  save(entity: LeagueRoomApplication): Promise<LeagueRoomApplication> {
    return this.repository.save(entity);
  }

  async findByRoomIdAndApplicationId({
    roomId,
    applicationId,
  }: {
    roomId: string;
    applicationId: string;
  }): Promise<LeagueRoomApplication | undefined> {
    return this.repository
      .createQueryBuilder('lra')
      .where('lra.room = :roomId', {
        roomId,
      })
      .andWhere('lra.id = :applicationId', { applicationId })
      .innerJoinAndSelect('lra.room', 'lrar')
      .getOne();
  }

  async findByLeagueUserAndRoomId({
    roomId,
    leagueUser,
  }: {
    roomId: string;
    leagueUser: LeagueUser;
  }): Promise<LeagueRoomApplication | undefined> {
    return this.repository
      .createQueryBuilder('lra')
      .where('lra.room = :roomId', {
        roomId,
      })
      .andWhere('lra.leagueUser = :leagueUserId', {
        leagueUserId: leagueUser.id,
      })
      .getOne();
  }

  async checkIfIsRoomOwner({
    roomId,
    leagueUser,
  }: {
    roomId: string;
    leagueUser: LeagueUser;
  }): Promise<boolean> {
    const roomOwner = await this.repository
      .createQueryBuilder('lra')
      .where('lra.room = :roomId', { roomId })
      .andWhere('lra.leagueUser = :leagueUserId AND lra.isOwner IS TRUE', {
        leagueUserId: leagueUser.id,
      })
      .getOne();
    return !!roomOwner;
  }

  async checkIfJoinedRoom({
    roomId,
    leagueUser,
  }: {
    roomId: string;
    leagueUser: LeagueUser;
  }): Promise<boolean> {
    const joinedRoom = await this.repository
      .createQueryBuilder('lra')
      .where('lra.room = :roomId', { roomId })
      .andWhere('lra.leagueUser = :leagueUserId AND lra.status = :status', {
        leagueUserId: leagueUser.id,
        status: LEAGUE_ROOM_APPLICATION_STATUS.APPROVED,
      })
      .getOne();

    return !!joinedRoom;
  }

  async findByApplicationStatus({
    roomId,
    status,
  }: {
    roomId: string;
    status: LEAGUE_ROOM_APPLICATION_STATUS;
  }): Promise<LeagueRoomApplication[]> {
    return this.repository
      .createQueryBuilder('lra')
      .where('lra.room = :roomId', { roomId })
      .andWhere('lra.status = :status', { status })
      .getMany();
  }
}
