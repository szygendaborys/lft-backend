import { Injectable, Logger, LoggerService } from '@nestjs/common';
import { inspect } from 'util';
import { Method } from 'axios';

@Injectable()
export class HttpLogger implements LoggerService {
  private readonly logger: Logger = new Logger();

  log({ method, route }: { method: Method | string; route: string }) {
    this.logger.log(`[HTTP_SERVICE]: Fetching (${method}) ${route}...`);
  }

  error({
    method,
    route,
    trace,
  }: {
    method: Method | string;
    route: string;
    trace?: any;
  }) {
    this.logger.error(
      `[HTTP_SERVICE]: Error during fetch (${method}) ${route} \n` +
        `#TRACE: ${inspect(trace)}`,
    );
  }

  warn() {
    throw new Error('Method not implemented.');
  }
}
