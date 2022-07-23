import { inspect } from 'util';
import { UnprocessableHandlerInstanceException } from './exceptions/unprocessable-handler-instance.exception';
import { NotificationEntity } from './notification.entity';
import { NotificationHandler } from './handlers/notification.handler';
import { User } from './../../users/user.entity';
import { Injectable, Logger } from '@nestjs/common';
import { NotificationTypes } from './notification.config';
import { NotificationRepository } from './notification.repository';

@Injectable()
export class NotificationMedium {
  constructor(
    private readonly notificationRepository: NotificationRepository,
    private readonly config: ReadonlyMap<
      NotificationTypes,
      NotificationHandler[]
    >,
    private readonly logger: Logger,
  ) {}

  async sendNotification({
    user,
    type,
    data,
  }: {
    user: User;
    type: NotificationTypes;
    data: Record<string, any>;
  }): Promise<void> {
    const handlers = this.config.get(type);

    if (!handlers) {
      throw new UnprocessableHandlerInstanceException(type);
    }

    const notification = NotificationEntity.createNotification({
      user,
      type,
      data,
      handlers,
    });

    notification.startProcessing();

    await this.notificationRepository.saveNotification(notification);

    try {
      for (const handler of handlers) {
        await handler.handle({
          user,
          type,
          data,
        });
      }

      notification.finishProcessing();
    } catch (e) {
      this.logger.error(
        `${NotificationMedium.name} an error occurred: \n ${inspect(e)}`,
      );

      notification.failProcessing();

      throw e;
    } finally {
      await this.notificationRepository.saveNotification(notification);
    }
  }
}
