import { ForbiddenException, Injectable } from '@nestjs/common';
import { v4 } from 'uuid';
import { UserNotFoundException } from '../../../users/user-not-found.exception';
import { UserRepository } from '../../../users/user.repository';
import { RIOT_API_POSITIONS } from '../../riotApi/riotApi.config';
import { LeagueUserNotFoundException } from '../../users/exceptions/league-user-not-found.exception';
import { InvalidLeagueRoomPositionException } from '../invalid-league-room-position.exception';
import { LeagueRoomNotFoundException } from '../league-room-not-found.exception';
import { LeagueRoomsRepository } from '../league-rooms.repository';
import { UpdateLeagueRoomApplicationDto } from './dto/update-league-room-application.dto';
import { LeagueRoomApplicationNotFoundException } from './league-room-application-not-found.exception';
import { LeagueRoomApplication } from './league-room-application.entity';
import { LeagueRoomApplicationStrategyResolver } from './league-room-application.strategy-resolver';
import { LEAGUE_ROOM_APPLICATION_STATUS } from './league-room-applications.config';
import { LeagueRoomApplicationsRepository } from './league-room-applications.repository';

@Injectable()
export class LeagueRoomApplicationsService {
  constructor(
    private readonly usersRepository: UserRepository,
    private readonly leagueRoomsRepository: LeagueRoomsRepository,
    private readonly leagueRoomApplicationStrategyResolver: LeagueRoomApplicationStrategyResolver,
    private readonly leagueRoomApplicationsRepository: LeagueRoomApplicationsRepository,
  ) {}

  async getRoomApplicationsByStatus({
    roomId,
    status,
    userId,
  }: {
    roomId: string;
    status: LEAGUE_ROOM_APPLICATION_STATUS;
    userId: string;
  }): Promise<LeagueRoomApplication[]> {
    const user = await this.usersRepository.findOneById(userId);
    const leagueUser = user?.games?.league_of_legends;

    if (!user) {
      throw new UserNotFoundException();
    }

    if (!leagueUser) {
      throw new LeagueUserNotFoundException();
    }

    const isRoomOwner =
      await this.leagueRoomApplicationsRepository.checkIfIsRoomOwner({
        roomId,
        leagueUser,
      });

    if (!isRoomOwner) {
      throw new ForbiddenException();
    }

    return this.leagueRoomApplicationsRepository.findByApplicationStatus({
      roomId,
      status,
    });
  }

  async apply({
    roomId,
    demandedPosition,
    userId,
  }: {
    roomId: string;
    demandedPosition: RIOT_API_POSITIONS;
    userId: string;
  }): Promise<LeagueRoomApplication> {
    const user = await this.usersRepository.findOneById(userId);
    const leagueUser = user?.games?.league_of_legends;

    if (!user) {
      throw new UserNotFoundException();
    }

    if (!leagueUser) {
      throw new LeagueUserNotFoundException();
    }

    const leagueRoom = await this.leagueRoomsRepository.findOneByIdAndRegion({
      roomId,
      region: leagueUser.region,
    });

    if (!leagueRoom) {
      throw new LeagueRoomNotFoundException();
    }

    if (!leagueRoom.demandedPositions.includes(demandedPosition)) {
      throw new InvalidLeagueRoomPositionException();
    }

    const application = new LeagueRoomApplication({
      id: v4(),
      room: leagueRoom,
      status: LEAGUE_ROOM_APPLICATION_STATUS.PENDING,
      leagueUser,
      appliedForPosition: demandedPosition,
    });

    leagueRoom.addApplication(application);

    await this.leagueRoomsRepository.saveRoom(leagueRoom);

    return application;
  }

  async handleApplication({
    roomId,
    applicationId,
    updateLeagueRoomApplicationDto,
    userId,
  }: {
    roomId: string;
    applicationId: string;
    updateLeagueRoomApplicationDto: UpdateLeagueRoomApplicationDto;
    userId: string;
  }): Promise<void> {
    const resolver = this.leagueRoomApplicationStrategyResolver.resolve(
      updateLeagueRoomApplicationDto,
    );

    const user = await this.usersRepository.findOneById(userId);
    const leagueUser = user?.games?.league_of_legends;

    if (!user) {
      throw new UserNotFoundException();
    }

    if (!leagueUser) {
      throw new LeagueUserNotFoundException();
    }

    const leagueRoomApplication =
      await this.leagueRoomApplicationsRepository.findByRoomIdAndApplicationId({
        roomId,
        applicationId,
      });

    if (!leagueRoomApplication) {
      throw new LeagueRoomApplicationNotFoundException();
    }

    await resolver.handle(leagueRoomApplication);
  }
}
