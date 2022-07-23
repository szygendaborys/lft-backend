import { Injectable } from '@nestjs/common';
import { NotificationTypes } from '../notification/notification.config';

@Injectable()
export abstract class Mailer {
  abstract sendMail({
    email,
    type,
    data,
  }: {
    email: string;
    type: NotificationTypes;
    data: Record<string, any>;
  }): Promise<void>;
}
