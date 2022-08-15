import { User } from '../users/user.entity';
import { Column, Entity, Index, ManyToOne } from 'typeorm';
import { AbstractEntity } from '../shared/abstract.entity';
import { v4 } from 'uuid';

@Entity('room_chat_message')
export class RoomChatMessageEntity extends AbstractEntity {
  @ManyToOne(() => User, (u) => u.roomChatMessages, {
    onDelete: 'CASCADE',
  })
  author: User;

  @Column({
    type: 'varchar',
    length: 5000,
    nullable: false,
  })
  message: string;

  @Column({
    name: 'room_id',
    type: 'uuid',
    nullable: false,
  })
  @Index('chat_message_room_id')
  roomId: string;

  private constructor(partial: Partial<RoomChatMessageEntity>) {
    super();
    Object.assign(this, partial);
  }

  static createMessage({
    message,
    roomId,
    user,
  }: {
    message: string;
    roomId: string;
    user: User;
  }): RoomChatMessageEntity {
    return new RoomChatMessageEntity({
      id: v4(),
      createdAt: new Date(),
      author: user,
      message,
      roomId,
    });
  }
}
