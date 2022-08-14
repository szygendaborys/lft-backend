import { Module } from '@nestjs/common';
import { WebsocketLogger } from '../shared/loggers/websocket.logger';
import { ChatGateway } from './chat.gateway';

@Module({
  imports: [],
  providers: [ChatGateway, WebsocketLogger],
  controllers: [],
  exports: [],
})
export class ChatModule {}
