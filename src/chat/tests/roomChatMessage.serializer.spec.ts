import { createRoomChatMessage } from '../../../test/utils/message.utils';
import { RoomChatMessageSerializer } from './../roomChatMessage.serializer';

describe('RoomChatMessageSerializer unit tests', () => {
  let serializer: RoomChatMessageSerializer;

  beforeEach(() => {
    jest.resetAllMocks();

    serializer = new RoomChatMessageSerializer();
  });

  it('Should serialize the entity correctly', () => {
    const messageEntity = createRoomChatMessage();

    const result = serializer.serialize(messageEntity);

    expect(result).toMatchObject({
      id: messageEntity.id,
      author: messageEntity.author.username,
      authorId: messageEntity.author.id,
      message: messageEntity.message,
      timestamp: new Date(messageEntity.createdAt).getTime(),
    });
  });
});
