import { NotificationHandler } from './handlers/notification.handler';
import { User } from './../../users/user.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { AbstractEntity } from '../abstract.entity';
import { NotificationTypes } from './notification.config';
import { NotificationStatus } from './notification.status';

@Entity('notification')
export class NotificationEntity extends AbstractEntity {
  @Column({
    type: 'varchar',
    length: 255,
    nullable: false,
    enum: NotificationTypes,
  })
  type: NotificationTypes;

  @Column({
    array: true,
    type: 'varchar',
    nullable: false,
  })
  handlers: string[];

  @Column({
    type: 'varchar',
    length: 255,
    nullable: false,
    enum: NotificationStatus,
  })
  status: NotificationStatus;

  @Column({
    type: 'smallint',
    nullable: false,
    default: 0,
  })
  retries: number;

  @Column({
    type: 'json',
    nullable: false,
    default: {},
  })
  data: Record<string, any> = {};

  @ManyToOne(() => User, (u) => u.mails, {
    eager: true,
    onDelete: 'CASCADE',
    nullable: false,
  })
  @JoinColumn()
  user: User;

  static createNotification(
    payload: Pick<NotificationEntity, 'type' | 'user' | 'data'> & {
      handlers: NotificationHandler[];
    },
  ): NotificationEntity {
    const handlers = payload.handlers.map((handler) =>
      handler.getHandlerName(),
    );

    return new NotificationEntity({
      ...payload,
      retries: 0,
      status: NotificationStatus.CREATED,
      handlers,
    });
  }

  constructor(partial: Partial<NotificationEntity>) {
    super();
    Object.assign(this, partial);
  }

  startProcessing(): void {
    this.status = NotificationStatus.PROCESSING;
    this.retries += 1;
  }

  finishProcessing(): void {
    this.status = NotificationStatus.PROCESSED;
  }

  failProcessing(): void {
    this.status = NotificationStatus.FAILED;
  }
}
