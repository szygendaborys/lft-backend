import { RoomChatMessageEntity } from './roomChatMessage.entity';
import { RoomChatMessageService } from './roomChatMessage.service';
import { RoomChatMessageSerializer } from './roomChatMessage.serializer';
import { SocketWithUser } from '../shared/socketWithUser';
import { RoomChatMessageInputDto } from './dto/roomChatMessageInput.dto';
import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
} from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { WebsocketLogger } from '../shared/loggers/websocket.logger';
import { UseGuards } from '@nestjs/common';
import { JwtWebsocketsAuthGuard } from '../auth/jwt-websockets-auth.guard';
import { WsLeagueRoomDetailsGuard } from '../league/rooms/wsLeagueRoomDetails.guard';

@WebSocketGateway({
  cors: true,
})
@UseGuards(JwtWebsocketsAuthGuard, WsLeagueRoomDetailsGuard)
export class RoomChatGateway {
  constructor(
    private readonly logger: WebsocketLogger,
    private readonly roomChatMessageService: RoomChatMessageService,
    private readonly roomChatMessageSerializer: RoomChatMessageSerializer,
  ) {}

  @SubscribeMessage('subscribe_to_room')
  subscribeToRoom(
    @MessageBody() roomId: string,
    @ConnectedSocket() socket: Socket,
  ): void {
    this.logger.logEvent('subscribe_to_room');

    socket.join(roomId);
  }

  @SubscribeMessage('unsubscribe_from_room')
  unsubscribeFromRoom(
    @MessageBody() roomId: string,
    @ConnectedSocket() socket: Socket,
  ): void {
    this.logger.logEvent('unsubscribe_from_room');

    socket.leave(roomId);
  }

  @SubscribeMessage('send_message')
  async listenForMessages(
    @MessageBody() { message, roomId }: RoomChatMessageInputDto,
    @ConnectedSocket() socket: SocketWithUser,
  ): Promise<void> {
    this.logger.logEvent('send_message');
    const { user } = socket;

    const messageEntity = RoomChatMessageEntity.createMessage({
      message,
      roomId,
      user,
    });

    const serializedMessageOutput =
      this.roomChatMessageSerializer.serialize(messageEntity);

    socket.broadcast
      .to(roomId)
      .emit('receive_message', serializedMessageOutput);

    await this.roomChatMessageService.saveMessage(messageEntity);
  }
}
