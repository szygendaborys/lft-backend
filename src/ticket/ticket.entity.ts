import { User } from '../users/user.entity';
import { Column, Entity, Index, ManyToOne } from 'typeorm';
import { AbstractEntity } from '../shared/abstract.entity';
import { TicketType } from './ticket.types';

@Entity('ticket')
export class Ticket extends AbstractEntity {
  @Column({
    type: 'varchar',
    length: 5000,
    nullable: false,
  })
  message: string;

  @Column({
    name: 'type',
    type: 'smallint',
    enum: TicketType,
    nullable: false,
  })
  type: TicketType;

  @Column({
    name: 'author_name',
    type: 'varchar',
    length: 100,
    nullable: true,
  })
  authorName: string | null;

  @Column({
    name: 'author_email',
    type: 'varchar',
    length: 100,
    nullable: true,
  })
  authorEmail: string | null;

  constructor(partial: Partial<Ticket>) {
    super();
    Object.assign(this, partial);
  }
}
