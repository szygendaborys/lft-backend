import { EntityRepository, Repository } from 'typeorm';
import { PageDto } from '../../shared/page/page.dto';
import { RIOT_API_REGIONS } from '../riotApi/riotApi.config';
import { LeagueUser } from '../users/league-user.entity';
import { LEAGUE_ROOM_APPLICATION_STATUS } from './applications/league-room-applications.config';
import { LeagueRoomQueryDto } from './dto/league-room.query.dto';
import { SearchLeagueRoomQueryDto } from './dto/search-league-room.query.dto';
import { LeagueRoom } from './league-room.entity';

@EntityRepository(LeagueRoom)
export class LeagueRoomsRepository extends Repository<LeagueRoom> {
  async findOneByIdAndRegion({
    roomId,
    region,
  }: {
    roomId: string;
    region: RIOT_API_REGIONS;
  }): Promise<LeagueRoom | undefined> {
    return this.createQueryBuilder('lr')
      .leftJoinAndSelect('lr.applications', 'lra')
      .where('lr.id = :roomId', { roomId })
      .andWhere('lr.region = :region', { region })
      .andWhere('lr.date > now()')
      .getOne();
  }

  async saveRoom(leagueRoom: LeagueRoom): Promise<LeagueRoom> {
    return this.save(leagueRoom);
  }

  /**
   * @desc
   * note: This query might require optimization later on
   * 4 joins are only to get user details from all applications
   * @param param0
   * @returns
   */
  async searchRooms({
    pageOptionsDto,
    leagueUser,
  }: {
    pageOptionsDto: SearchLeagueRoomQueryDto;
    leagueUser: LeagueUser;
  }): Promise<PageDto<LeagueRoom>> {
    const { dateFrom, dateTo, demandedPositions, order } = pageOptionsDto;

    const query = this.createQueryBuilder('lr')
      .innerJoinAndSelect('lr.applications', 'lra', 'lra.status = :status', {
        status: LEAGUE_ROOM_APPLICATION_STATUS.APPROVED,
      })
      .leftJoinAndSelect('lra.leagueUser', 'lral')
      .leftJoinAndSelect('lral.userGames', 'lralu')
      .leftJoinAndSelect('lralu.user', 'lraluu')
      .where((qb) => {
        const subQuery = qb
          .subQuery()
          .select('lrx.id')
          .from(LeagueRoom, 'lrx')
          .innerJoin('lrx.applications', 'lrax')
          .innerJoin('lrax.leagueUser', 'lralux', 'lralux.id = :leagueUserId', {
            leagueUserId: leagueUser.id,
          })
          .getQuery();

        return `lr.id NOT IN (${subQuery})`;
      })
      .andWhere('lr.date > now()')
      .andWhere('lr.region = :region', { region: leagueUser.region })
      .andWhere('array_length(lr.demanded_positions, 1) > 0')
      .orderBy('lr.date', order);

    if (dateFrom) {
      query.andWhere('lr.date >= :dateFrom', { dateFrom });
    }

    if (dateTo) {
      query.andWhere('lr.date <= :dateTo', { dateTo });
    }

    if (demandedPositions) {
      query.andWhere('lr.demanded_positions[1] IN (:...demandedPositions)', {
        demandedPositions,
      });
    }

    return query.paginate(pageOptionsDto);
  }

  async searchUserRooms({
    pageOptionsDto,
    leagueUser,
  }: {
    pageOptionsDto: LeagueRoomQueryDto;
    leagueUser: LeagueUser;
  }): Promise<PageDto<LeagueRoom>> {
    const { order, status } = pageOptionsDto;

    return this.createQueryBuilder('lr')
      .innerJoinAndSelect('lr.applications', 'lra', 'lra.status = :status', {
        status: LEAGUE_ROOM_APPLICATION_STATUS.APPROVED,
      })
      .leftJoinAndSelect('lra.leagueUser', 'lral')
      .leftJoinAndSelect('lral.userGames', 'lralu')
      .leftJoinAndSelect('lralu.user', 'lraluu')
      .where((qb) => {
        const subQuery = qb
          .subQuery()
          .select('lrx.id')
          .from(LeagueRoom, 'lrx')
          .innerJoin('lrx.applications', 'lrax', 'lrax.status = :status', {
            status,
          })
          .innerJoin('lrax.leagueUser', 'lralux', 'lralux.id = :leagueUserId', {
            leagueUserId: leagueUser.id,
          })
          .getQuery();

        return `lr.id IN (${subQuery})`;
      })
      .andWhere("lr.date > now() - interval '1 hour'")
      .andWhere('lr.region = :region', { region: leagueUser.region })
      .orderBy('lr.date', order)
      .paginate(pageOptionsDto);
  }

  async getRoomDetails({
    roomId,
    leagueUser,
  }: {
    roomId: string;
    leagueUser: LeagueUser;
  }): Promise<LeagueRoom | undefined> {
    return this.createQueryBuilder('lr')
      .where('lr.id = :roomId', { roomId })
      .innerJoin(
        'lr.applications',
        'lrax',
        'lrax.status = :status AND lrax.leagueUser = :leagueUserId',
        {
          status: LEAGUE_ROOM_APPLICATION_STATUS.APPROVED,
          leagueUserId: leagueUser.id,
        },
      )
      .leftJoinAndSelect('lr.applications', 'lra')
      .leftJoinAndSelect('lra.leagueUser', 'lral')
      .leftJoinAndSelect('lral.userGames', 'lralu')
      .leftJoinAndSelect('lralu.user', 'lraluu')
      .getOne();
  }
}
