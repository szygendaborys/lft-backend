import { ChatModule } from './../chat.module';
import { INestApplication, HttpStatus } from '@nestjs/common';
import * as faker from 'faker';
import {
  compileTestingModule,
  init,
  clearSchema,
  makeRequest,
  authHeaderJwt,
} from '../../../test/test.module';
import { saveUserGames } from '../../../test/utils/games.utils';
import {
  saveLeagueRoom,
  saveLeagueUser,
} from '../../../test/utils/league.utils';
import { saveUser } from '../../../test/utils/user.utils';
import { UserGames } from '../../games/userGames.entity';
import { LeagueUser } from '../../league/users/league-user.entity';
import { User } from '../../users/user.entity';
import { saveRoomChatMessage } from '../../../test/utils/message.utils';

describe('Room chat messages integration tests', () => {
  let app: INestApplication;

  let user: User;
  let userGames: UserGames;
  let leagueUser: LeagueUser;

  beforeAll(async () => {
    const module = await compileTestingModule([ChatModule]);

    app = await init(module);
  });

  beforeEach(async () => {
    jest.resetAllMocks();
    await clearSchema();

    user = await saveUser();
    userGames = await saveUserGames({ user });
    leagueUser = await saveLeagueUser({ userGames });
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GET - get room chat messages', () => {
    const getRoute = (roomId = faker.datatype.uuid()) =>
      `/api/v1/rooms/chat/messages/${roomId}`;

    it('404 - room not found', async () => {
      const res = await makeRequest(app)
        .get(getRoute())
        .set(authHeaderJwt({ id: user.id }));

      expect(res.status).toBe(HttpStatus.NOT_FOUND);
    });

    it('401 - unauthorized (user not found)', async () => {
      const res = await makeRequest(app)
        .get(getRoute())
        .set(authHeaderJwt({ id: faker.datatype.uuid() }));

      expect(res.status).toBe(HttpStatus.UNAUTHORIZED);
    });

    it('401', async () => {
      const res = await makeRequest(app).get(getRoute());

      expect(res.status).toBe(HttpStatus.UNAUTHORIZED);
    });

    it('200 - should fetch empty array', async () => {
      const leagueRoom = await saveLeagueRoom({
        owner: leagueUser,
      });

      const res = await makeRequest(app)
        .get(getRoute(leagueRoom.id))
        .set(authHeaderJwt({ id: user.id }));

      expect(res.status).toBe(HttpStatus.OK);
      expect(res.body).toMatchObject({
        data: [],
        meta: {
          page: 1,
          take: 10,
          itemCount: 0,
          pageCount: 0,
          hasPreviousPage: false,
          hasNextPage: false,
        },
      });
    });

    it('200 - should fetch sorted messages', async () => {
      const leagueRoom = await saveLeagueRoom({
        owner: leagueUser,
      });

      const firstMessage = await saveRoomChatMessage({
        roomId: leagueRoom.id,
        author: await saveUser(),
      });
      const secondMessage = await saveRoomChatMessage({
        roomId: leagueRoom.id,
        author: await saveUser(),
      });

      const res = await makeRequest(app)
        .get(getRoute(leagueRoom.id))
        .set(authHeaderJwt({ id: user.id }));

      expect(res.status).toBe(HttpStatus.OK);
      expect(res.body).toMatchObject({
        data: expect.arrayContaining([
          expect.objectContaining({
            id: firstMessage.id,
            author: firstMessage.author.username,
            authorId: firstMessage.author.id,
            message: firstMessage.message,
            timestamp: firstMessage.createdAt.getTime(),
          }),
          expect.objectContaining({
            id: secondMessage.id,
            author: secondMessage.author.username,
            authorId: secondMessage.author.id,
            message: secondMessage.message,
            timestamp: secondMessage.createdAt.getTime(),
          }),
        ]),
        meta: {
          page: 1,
          take: 10,
          itemCount: 2,
          pageCount: 1,
          hasPreviousPage: false,
          hasNextPage: false,
        },
      });
    });
  });
});
