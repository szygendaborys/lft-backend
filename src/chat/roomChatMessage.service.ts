import { LeagueRoomNotFoundException } from './../league/rooms/league-room-not-found.exception';
import { PageOptionsDto } from './../shared/page/pageOptions.dto';
import { LeagueRoomApplicationsRepository } from './../league/rooms/applications/league-room-applications.repository';
import { UserRepository } from './../users/user.repository';
import { RoomChatMessagesRepository } from './roomChatMessages.repository';
import { RoomChatMessageEntity } from './roomChatMessage.entity';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PageDto } from '../shared/page/page.dto';
import { UserNotFoundException } from '../users/user-not-found.exception';
import { LeagueUserNotFoundException } from '../league/users/exceptions/league-user-not-found.exception';

@Injectable()
export class RoomChatMessageService {
  constructor(
    private readonly roomChatMessageRepository: RoomChatMessagesRepository,
    private readonly usersRepository: UserRepository,
    private readonly leagueRoomApplicationsRepository: LeagueRoomApplicationsRepository,
  ) {}

  async saveMessage(
    message: RoomChatMessageEntity,
  ): Promise<RoomChatMessageEntity> {
    return this.roomChatMessageRepository.saveMessage(message);
  }

  async fetchMessages({
    pageOptionsDto,
    roomId,
    userId,
  }: {
    pageOptionsDto: PageOptionsDto;
    roomId: string;
    userId: string;
  }): Promise<PageDto<RoomChatMessageEntity>> {
    const user = await this.usersRepository.findOneById(userId);
    const leagueUser = user?.games?.league_of_legends;

    if (!user) {
      throw new UserNotFoundException();
    }

    if (!leagueUser) {
      throw new LeagueUserNotFoundException();
    }

    const hasJoinedTheRoom =
      await this.leagueRoomApplicationsRepository.checkIfJoinedRoom({
        roomId,
        leagueUser,
      });

    if (!hasJoinedTheRoom) {
      throw new LeagueRoomNotFoundException();
    }

    return this.roomChatMessageRepository.getAllMessagesForRoom({
      roomId,
      pageOptionsDto,
    });
  }
}
