import { EntityRepository, Repository } from 'typeorm';
import { NotificationEntity } from './notification.entity';

@EntityRepository(NotificationEntity)
export class NotificationRepository extends Repository<NotificationEntity> {
  async saveNotification(entity: NotificationEntity): Promise<void> {
    await this.save(entity);
  }
}
