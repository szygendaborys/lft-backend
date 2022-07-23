import { User } from '../../../users/user.entity';
import { NotificationTypes } from '../notification.config';

export interface NotificationHandler {
  handle: (data: {
    user: User;
    type: NotificationTypes;
    data: Record<string, any>;
  }) => Promise<void> | void;
  getHandlerName(): string;
}
