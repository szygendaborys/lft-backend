import { WsException } from '@nestjs/websockets';
import { Injectable, Logger } from '@nestjs/common';
import { inspect } from 'util';

@Injectable()
export class WebsocketLogger {
  private readonly logger: Logger = new Logger();

  logEvent(event: string): void {
    this.logger.log(`[WS_EVENT_TRIGGERED]: ${event}`);
  }

  logError(error: WsException): void {
    this.logger.error(`[WS_EXCEPTION]: ${inspect(error)}`);
  }
}
