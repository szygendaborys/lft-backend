import { RoomChatMessageDto } from './dto/roomChatMessage.dto';
import { RoomChatMessageEntity } from './roomChatMessage.entity';
import { AbstractSerializer } from '../shared/serializer/abstract.serializer';

export class RoomChatMessageSerializer extends AbstractSerializer<
  RoomChatMessageEntity,
  RoomChatMessageDto
> {
  public serialize(messageEntity: RoomChatMessageEntity): RoomChatMessageDto {
    const { author, message, createdAt } = messageEntity;

    return {
      author: author.username,
      authorId: author.id,
      message,
      timestamp: createdAt.getTime(),
    };
  }
}
