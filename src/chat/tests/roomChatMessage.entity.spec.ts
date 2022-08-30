import { RoomChatMessageEntity } from './../roomChatMessage.entity';
import * as faker from 'faker';
import { createUser } from '../../../test/utils/user.utils';

describe('RoomChatMessageEntity unit tests', () => {
  it('Should create a valid room chat message entity from the payload', () => {
    const message = RoomChatMessageEntity.createMessage({
      message: faker.random.word(),
      roomId: faker.datatype.uuid(),
      user: createUser(),
    });

    expect(message).toBeInstanceOf(RoomChatMessageEntity);
  });

  it('The content should match', () => {
    const message = faker.random.word();
    const roomId = faker.datatype.uuid();
    const user = createUser();

    const messageEntity = RoomChatMessageEntity.createMessage({
      message,
      roomId,
      user,
    });

    expect(messageEntity).toMatchObject({
      id: expect.any(String),
      message,
      roomId,
      author: expect.objectContaining(user),
    });
  });
});
