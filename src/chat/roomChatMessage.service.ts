import { RoomChatMessagesRepository } from './roomChatMessages.repository';
import { RoomChatMessageEntity } from './roomChatMessage.entity';
import { Injectable } from '@nestjs/common';

@Injectable()
export class RoomChatMessageService {
  constructor(
    private readonly roomChatMessageRepository: RoomChatMessagesRepository,
  ) {}

  async saveMessage(
    message: RoomChatMessageEntity,
  ): Promise<RoomChatMessageEntity> {
    return this.roomChatMessageRepository.saveMessage(message);
  }
}
