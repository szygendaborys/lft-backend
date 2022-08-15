import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LeagueRoomApplicationsRepository } from '../league/rooms/applications/league-room-applications.repository';
import { WebsocketLogger } from '../shared/loggers/websocket.logger';
import { User } from '../users/user.entity';
import { UserRepository } from '../users/user.repository';
import { LeagueRoomApplication } from './../league/rooms/applications/league-room-application.entity';
import { RoomChatGateway } from './roomChat.gateway';

@Module({
  imports: [TypeOrmModule.forFeature([User, LeagueRoomApplication])],
  providers: [
    RoomChatGateway,
    WebsocketLogger,
    UserRepository,
    LeagueRoomApplicationsRepository,
  ],
})
export class ChatModule {}
