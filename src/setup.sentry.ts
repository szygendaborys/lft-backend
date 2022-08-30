import { INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SharedModule } from './shared/shared.module';
import * as Sentry from '@sentry/node';

export const setupSentry = (app: INestApplication): void => {
  const configService = app.select(SharedModule).get(ConfigService);

  Sentry.init({
    dsn: configService.get('SENTRY_DSN'),
    tracesSampleRate: 0.1,
  });
};
