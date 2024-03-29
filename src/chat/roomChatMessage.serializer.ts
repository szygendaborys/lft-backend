import { RoomChatMessageDto } from './dto/roomChatMessage.dto';
import { RoomChatMessageEntity } from './roomChatMessage.entity';
import { AbstractSerializer } from '../shared/serializer/abstract.serializer';

export class RoomChatMessageSerializer extends AbstractSerializer<
  RoomChatMessageEntity,
  RoomChatMessageDto
> {
  public serialize(messageEntity: RoomChatMessageEntity): RoomChatMessageDto {
    const { id, author, message, createdAt } = messageEntity;

    return {
      id,
      author: author.username,
      authorId: author.id,
      message,
      timestamp: createdAt.getTime(),
    };
  }
}
