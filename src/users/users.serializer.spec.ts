import { createUser } from '../../test/utils/user.utils';
import { UsersSerializer } from './users.serializer';
import * as faker from 'faker';
import { UserGamesSerializer } from '../games/serializers/user.games.serializer';
import { User } from './user.entity';

describe('User serializer unit tests', () => {
  let serializer: UsersSerializer;
  const mockSerializer = ({
    serialize: jest.fn(),
  } as unknown) as UserGamesSerializer;

  beforeEach(() => {
    serializer = new UsersSerializer(mockSerializer);
  });

  it('Should serialize user dto', () => {
    const given = createUser();
    const fakeUUID = faker.datatype.uuid();

    const result = serializer.serialize(
      new User({
        ...given,
        id: fakeUUID,
      }),
    );

    expect(result).toMatchObject({
      username: given.username,
      id: fakeUUID,
    });
  });

  it('Should serialize array user dto', () => {
    const given = createUser();
    const fakeUUID = faker.datatype.uuid();

    const result = serializer.serializeCollection([
      new User({
        ...given,
        id: fakeUUID,
      }),
    ]);

    expect(result).toMatchObject(
      expect.arrayContaining([
        {
          username: given.username,
          id: fakeUUID,
        },
      ]),
    );
  });
});
