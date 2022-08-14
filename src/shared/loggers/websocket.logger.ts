import { Injectable, Logger } from '@nestjs/common';
import { inspect } from 'util';
import { Method } from 'axios';

@Injectable()
export class WebsocketLogger {
  private readonly logger: Logger = new Logger();

  logEvent(event: string): void {
    this.logger.log(`[WS_EVENT_TRIGGERED]: ${event}`);
  }
}
