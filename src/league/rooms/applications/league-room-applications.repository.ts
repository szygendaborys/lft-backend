import { EntityRepository, Repository } from 'typeorm';
import { LeagueUser } from '../../users/league-user.entity';
import { LeagueRoomApplication } from './league-room-application.entity';
import { LEAGUE_ROOM_APPLICATION_STATUS } from './league-room-applications.config';

@EntityRepository(LeagueRoomApplication)
export class LeagueRoomApplicationsRepository extends Repository<LeagueRoomApplication> {
  async findByRoomIdAndApplicationId({
    roomId,
    applicationId,
  }: {
    roomId: string;
    applicationId: string;
  }): Promise<LeagueRoomApplication | undefined> {
    return this.createQueryBuilder('lra')
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
    return this.createQueryBuilder('lra')
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
    const roomOwner = await this.createQueryBuilder('lra')
      .where('lra.room = :roomId', { roomId })
      .andWhere('lra.leagueUser = :leagueUserId AND lra.isOwner IS TRUE', {
        leagueUserId: leagueUser.id,
      })
      .getOne();
    return !!roomOwner;
  }

  async findByApplicationStatus({
    roomId,
    status,
  }: {
    roomId: string;
    status: LEAGUE_ROOM_APPLICATION_STATUS;
  }): Promise<LeagueRoomApplication[]> {
    return this.createQueryBuilder('lra')
      .where('lra.room = :roomId', { roomId })
      .andWhere('lra.status = :status', { status })
      .getMany();
  }
}
