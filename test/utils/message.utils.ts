import { plainToInstance, ClassConstructor } from 'class-transformer';
import { RoomChatMessageEntity } from './../../src/chat/roomChatMessage.entity';
import * as faker from 'faker';
import { createUser } from './user.utils';

export const createRoomChatMessage = (opts?: Partial<RoomChatMessageEntity>) =>
  plainToInstance(
    RoomChatMessageEntity as unknown as ClassConstructor<RoomChatMessageEntity>,
    {
      id: faker.datatype.uuid(),
      message: faker.random.word(),
      roomId: faker.datatype.uuid(),
      author: createUser(),
      createdAt: faker.date.past(),
      ...opts,
    },
  );
