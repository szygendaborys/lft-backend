import { NotificationTypes } from './notification.config';
import { CustomLogger } from './../loggers/custom.logger';
import { MailHandler } from './handlers/mail.handler';
import { NotificationHandler } from './handlers/notification.handler';
import { NotificationMedium } from './notification.medium';
import { NotificationRepository } from './notification.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Module, Logger } from '@nestjs/common';

@Module({
  imports: [TypeOrmModule.forFeature([NotificationRepository])],
  providers: [
    MailHandler,
    {
      provide: NotificationMedium,
      useFactory: (
        notificationRepository: NotificationRepository,
        mailHandler: MailHandler,
        logger: Logger,
      ) => {
        const config: ReadonlyMap<
          NotificationTypes,
          NotificationHandler[]
        > = new Map<NotificationTypes, NotificationHandler[]>([
          [NotificationTypes.resetPasswordConfirmationLink, [mailHandler]],
        ]);

        return new NotificationMedium(notificationRepository, config, logger);
      },
      inject: [NotificationRepository, MailHandler, CustomLogger],
    },
  ],
  exports: [NotificationMedium],
})
export class NotificationModule {}
