import { PAGINATION_ROOM_CHAT_MESSAGE_SERIALIZER } from './roomChatMessage.config';
import { RoomChatMessageController } from './roomChatMessage.controller';
import { RoomChatMessageEntity } from './roomChatMessage.entity';
import { RoomChatMessageSerializer } from './roomChatMessage.serializer';
import { RoomChatMessagesRepository } from './roomChatMessages.repository';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LeagueRoomApplicationsRepository } from '../league/rooms/applications/league-room-applications.repository';
import { WebsocketLogger } from '../shared/loggers/websocket.logger';
import { User } from '../users/user.entity';
import { UserRepository } from '../users/user.repository';
import { LeagueRoomApplication } from './../league/rooms/applications/league-room-application.entity';
import { RoomChatGateway } from './roomChat.gateway';
import { RoomChatMessageService } from './roomChatMessage.service';
import { AbstractPaginationSerializer } from '../shared/serializer/abstract-pagination.serializer';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      LeagueRoomApplication,
      RoomChatMessageEntity,
    ]),
  ],
  controllers: [RoomChatMessageController],
  providers: [
    RoomChatGateway,
    WebsocketLogger,
    UserRepository,
    LeagueRoomApplicationsRepository,
    RoomChatMessagesRepository,
    RoomChatMessageSerializer,
    RoomChatMessageService,
    {
      provide: PAGINATION_ROOM_CHAT_MESSAGE_SERIALIZER,
      useFactory: (roomChatMessageSerializer: RoomChatMessageSerializer) => {
        return new AbstractPaginationSerializer(roomChatMessageSerializer);
      },
      inject: [RoomChatMessageSerializer],
    },
  ],
})
export class ChatModule {}
