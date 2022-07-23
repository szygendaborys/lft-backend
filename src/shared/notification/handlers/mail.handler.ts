import { NotificationHandler } from './notification.handler';
import { Injectable } from '@nestjs/common';
import { Mailer } from '../../mailer/mailer';
import { User } from '../../../users/user.entity';
import { NotificationTypes } from '../notification.config';

@Injectable()
export class MailHandler implements NotificationHandler {
  constructor(private readonly mailer: Mailer) {}

  async handle({
    user,
    type,
    data,
  }: {
    user: User;
    type: NotificationTypes;
    data: Record<string, any>;
  }): Promise<void> {
    await this.mailer.sendMail({
      email: user.email,
      type,
      data,
    });
  }

  getHandlerName(): string {
    return MailHandler.name;
  }
}
