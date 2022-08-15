import { RoomChatMessageEntity } from './roomChatMessage.entity';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class RoomChatMessagesRepository {
  constructor(
    @InjectRepository(RoomChatMessageEntity)
    private readonly repository: Repository<RoomChatMessageEntity>,
  ) {}

  saveMessage(message: RoomChatMessageEntity): Promise<RoomChatMessageEntity> {
    return this.repository.save(message);
  }

  getAllMessagesForRoom(roomId: string): Promise<RoomChatMessageEntity[]> {
    return this.repository.find({
      where: { roomId },
    });
  }
}
