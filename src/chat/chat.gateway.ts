import { ChatMessageInputDto } from './chatMessageInput.dto';
import { ChatMessageDto } from './chatMessage.dto';
import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
} from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { WebsocketLogger } from '../shared/loggers/websocket.logger';

@WebSocketGateway({
  cors: true,
})
export class ChatGateway {
  constructor(private readonly logger: WebsocketLogger) {}

  @SubscribeMessage('subscribe_to_room')
  subscribeToRoom(
    @MessageBody() roomId: string,
    @ConnectedSocket() socket: Socket,
  ) {
    this.logger.logEvent('subscribe_to_room');

    socket.join(roomId);
  }

  @SubscribeMessage('unsubscribe_from_room')
  unsubscribeFromRoom(
    @MessageBody() roomId: string,
    @ConnectedSocket() socket: Socket,
  ) {
    this.logger.logEvent('unsubscribe_from_room');

    socket.leave(roomId);
  }

  @SubscribeMessage('send_message')
  async listenForMessages(
    @MessageBody() { message, roomId }: ChatMessageInputDto,
    @ConnectedSocket() socket: Socket,
  ) {
    this.logger.logEvent('send_message');

    const receivedMessage: ChatMessageDto = {
      author: 'borys',
      authorId: 'me',
      message,
      timestamp: Date.now(),
    };

    socket.broadcast.to(roomId).emit('receive_message', receivedMessage);
  }
}
