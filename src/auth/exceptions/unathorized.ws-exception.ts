import { WsException } from '@nestjs/websockets';
import { WebsocketLogger } from '../../shared/loggers/websocket.logger';

export class UnauthorizedWsException extends WsException {
  constructor() {
    super(`Unauthorized`);
    new WebsocketLogger().logError(this);
  }
}
