import { NotificationMedium } from './notification/notification.medium';
import { NotificationModule } from './notification/notification.module';
import { CustomLogger } from './loggers/custom.logger';
import { Global, HttpModule, Module, Logger } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { RouterModule } from 'nest-router';
import routes from '../shared/routes';
import { Mailer } from './mailer/mailer';
import { SendgridMailer } from './mailer/sendgrid/sendgrid.mailer';
import { PlainToClassSerializer } from './serializer/plain-to-class.serializer';
import { AppConfig } from './services/app.config';
import { AppConfigModule } from './services/appConfig.module';

@Global()
@Module({
  imports: [
    AppConfigModule,
    RouterModule.forRoutes(routes),
    JwtModule.registerAsync({
      useFactory: (appConfig: AppConfig) => ({
        secretOrPrivateKey: appConfig.jwt.secret,
        signOptions: {
          expiresIn: appConfig.jwt.expirationTime,
        },
      }),
      inject: [AppConfig],
    }),
    HttpModule,
    NotificationModule,
  ],
  providers: [
    PlainToClassSerializer,
    {
      provide: Mailer,
      useFactory: (appConfig: AppConfig) => {
        return new SendgridMailer(appConfig, require('@sendgrid/mail'));
      },
      inject: [AppConfig],
    },
    {
      provide: CustomLogger,
      useFactory: () => {
        return new Logger('LFT_LOGGER');
      },
    },
  ],
  exports: [
    HttpModule,
    AppConfigModule,
    JwtModule,
    PlainToClassSerializer,
    Mailer,
    CustomLogger,
    NotificationModule,
  ],
})
export class SharedModule {}
