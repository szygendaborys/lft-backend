import { ConfigService } from '@nestjs/config';
import { NotificationTypes } from '../notification/notification.config';

export class AppConfig {
  nodeEnv: string;
  db: {
    name: string;
    host: string;
    port: number;
    username: string;
    password: string;
  };
  port: number;
  jwt: {
    expirationTime: number;
    refreshExpirationTime: number;
    secret: string;
  };
  riotApi: {
    key: string;
  };
  mailing: {
    sendgridApiKey: string;
    from: string;
    templates: ReadonlyMap<NotificationTypes, string>;
  };

  static load(configService: ConfigService): AppConfig {
    return {
      nodeEnv: configService.get('NODE_ENV'),
      db: {
        name: configService.get('POSTGRES_DB'),
        host: configService.get('POSTGRES_HOST'),
        port: +configService.get('POSTGRES_PORT'),
        username: configService.get('POSTGRES_USER'),
        password: configService.get('POSTGRES_PASSWORD'),
      },
      port: +configService.get('PORT'),
      jwt: {
        refreshExpirationTime: configService.get('JWT_REFRESH_EXPIRATION_TIME'),
        expirationTime: configService.get('JWT_EXPIRATION_TIME'),
        secret: configService.get('JWT_SECRET_KEY'),
      },
      riotApi: {
        key: configService.get('RIOT_API_KEY'),
      },
      mailing: {
        sendgridApiKey: configService.get('SENDGRID_API_KEY'),
        from: configService.get('SENDGRID_FROM_EMAIL'),
        templates: new Map([
          [
            NotificationTypes.resetPasswordConfirmationLink,
            configService.get('RESET_PASSWORD_CONFIRMATION_LINK_TEMPLATE'),
          ],
        ]),
      },
    };
  }
}
