import { LeagueUserRepository } from './../users/league-user.repository';
import { Injectable } from '@nestjs/common';
import { PageDto } from '../../shared/page/page.dto';
import { UserNotFoundException } from '../../users/user-not-found.exception';
import { UserRepository } from '../../users/user.repository';
import { LeagueUserNotFoundException } from '../users/exceptions/league-user-not-found.exception';
import { LeagueRoomApplication } from './applications/league-room-application.entity';
import { LEAGUE_ROOM_APPLICATION_STATUS } from './applications/league-room-applications.config';
import { LeagueRoomApplicationsRepository } from './applications/league-room-applications.repository';
import { CreateLeagueRoomDto } from './dto/create-league-room.dto';
import { LeagueRoomQueryDto } from './dto/league-room.query.dto';
import { SearchLeagueRoomQueryDto } from './dto/search-league-room.query.dto';
import { UpdateLeagueRoomDto } from './dto/update-league-room.dto';
import { LeagueRoomNotFoundException } from './league-room-not-found.exception';
import { LeagueRoomPositionDuplicated } from './league-room-position-duplicated.exception';
import { LeagueRoom } from './league-room.entity';
import { LeagueRoomsRepository } from './league-rooms.repository';

@Injectable()
export class LeagueRoomsService {
  constructor(
    private readonly leagueRoomsRepository: LeagueRoomsRepository,
    private readonly leagueRoomApplicationRepository: LeagueRoomApplicationsRepository,
    private readonly usersRepository: UserRepository,
    private readonly leagueUserRepository: LeagueUserRepository,
  ) {}

  async updateRoom({
    roomId,
    updateLeagueRoomDto,
    userId,
  }: {
    roomId: string;
    updateLeagueRoomDto: UpdateLeagueRoomDto;
    userId: string;
  }): Promise<void> {
    const user = await this.usersRepository.findOneById(userId);
    const leagueUser = user?.games?.league_of_legends;

    if (!user) {
      throw new UserNotFoundException();
    }

    if (!leagueUser) {
      throw new LeagueUserNotFoundException();
    }

    const leagueRoom = await this.leagueRoomsRepository.getRoomDetails({
      roomId,
      leagueUser,
    });

    if (!leagueRoom) {
      throw new LeagueRoomNotFoundException();
    }

    leagueRoom.updateDetails(updateLeagueRoomDto);

    await this.leagueRoomsRepository.saveRoom(leagueRoom);
  }

  async createNewRoom(
    createLeagueRoomDto: CreateLeagueRoomDto,
    userId: string,
  ): Promise<LeagueRoom> {
    const { ownerPosition, demandedPositions } = createLeagueRoomDto;

    const leagueUser = await this.leagueUserRepository.findByUserId(userId);

    if (!leagueUser) {
      throw new LeagueUserNotFoundException();
    }

    if (demandedPositions.includes(ownerPosition)) {
      throw new LeagueRoomPositionDuplicated();
    }

    const leagueRoom = LeagueRoom.create(createLeagueRoomDto);

    leagueRoom.addApplication(
      new LeagueRoomApplication({
        leagueUser,
        status: LEAGUE_ROOM_APPLICATION_STATUS.APPROVED,
        appliedForPosition: ownerPosition,
        isOwner: true,
      }),
    );

    await this.leagueRoomsRepository.saveRoom(leagueRoom);

    return leagueRoom;
  }

  async searchRooms(
    pageOptionsDto: SearchLeagueRoomQueryDto,
    userId: string,
  ): Promise<PageDto<LeagueRoom>> {
    const user = await this.usersRepository.findOneById(userId);
    const leagueUser = user?.games?.league_of_legends;

    if (!user) {
      throw new UserNotFoundException();
    }

    if (!leagueUser) {
      throw new LeagueUserNotFoundException();
    }

    return this.leagueRoomsRepository.searchRooms({
      pageOptionsDto,
      leagueUser,
    });
  }

  async searchUserRooms(
    pageOptionsDto: LeagueRoomQueryDto,
    userId: string,
  ): Promise<PageDto<LeagueRoom>> {
    const user = await this.usersRepository.findOneById(userId);
    const leagueUser = user?.games?.league_of_legends;

    if (!user) {
      throw new UserNotFoundException();
    }

    if (!leagueUser) {
      throw new LeagueUserNotFoundException();
    }

    return this.leagueRoomsRepository.searchUserRooms({
      pageOptionsDto,
      leagueUser,
    });
  }

  async getRoomDetails({
    roomId,
    userId,
  }: {
    roomId: string;
    userId: string;
  }): Promise<LeagueRoom> {
    const user = await this.usersRepository.findOneById(userId);
    const leagueUser = user?.games?.league_of_legends;

    if (!user) {
      throw new UserNotFoundException();
    }

    if (!leagueUser) {
      throw new LeagueUserNotFoundException();
    }

    const leagueRoom = await this.leagueRoomsRepository.getRoomDetails({
      roomId,
      leagueUser,
    });

    if (!leagueRoom) {
      throw new LeagueRoomNotFoundException();
    }

    return leagueRoom;
  }

  async leaveRoom({
    roomId,
    userId,
  }: {
    roomId: string;
    userId: string;
  }): Promise<void> {
    const user = await this.usersRepository.findOneById(userId);
    const leagueUser = user?.games?.league_of_legends;

    if (!user) {
      throw new UserNotFoundException();
    }

    if (!leagueUser) {
      throw new LeagueUserNotFoundException();
    }

    const [leagueRoom, leagueRoomApplication] = await Promise.all([
      this.leagueRoomsRepository.getRoomDetails({
        roomId,
        leagueUser,
      }),
      this.leagueRoomApplicationRepository.findByLeagueUserAndRoomId({
        roomId,
        leagueUser,
      }),
    ]);

    if (!leagueRoom || !leagueRoomApplication) {
      return;
    }

    leagueRoom.leave(leagueRoomApplication.id);

    if (leagueRoomApplication.isOwner) {
      leagueRoom.remove();
    }

    await this.leagueRoomsRepository.saveRoom(leagueRoom);
  }

  async removeRoom({
    roomId,
    userId,
  }: {
    roomId: string;
    userId: string;
  }): Promise<void> {
    const user = await this.usersRepository.findOneById(userId);
    const leagueUser = user?.games?.league_of_legends;

    if (!user) {
      throw new UserNotFoundException();
    }

    if (!leagueUser) {
      throw new LeagueUserNotFoundException();
    }

    const leagueRoom = await this.leagueRoomsRepository.getRoomDetails({
      roomId,
      leagueUser,
    });

    if (!leagueRoom) {
      return;
    }

    leagueRoom.remove();

    await this.leagueRoomsRepository.saveRoom(leagueRoom);
  }
}
