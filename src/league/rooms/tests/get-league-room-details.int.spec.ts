import { HttpStatus, INestApplication } from '@nestjs/common';
import * as faker from 'faker';
import {
  authHeaderJwt,
  clearSchema,
  compileTestingModule,
  init,
  makeRequest,
} from '../../../../test/test.module';
import { saveUserGames } from '../../../../test/utils/games.utils';
import {
  saveLeagueRoom,
  saveLeagueRoomApplication,
  saveLeagueUser,
} from '../../../../test/utils/league.utils';
import { saveUser } from '../../../../test/utils/user.utils';
import { UserGames } from '../../../games/userGames.entity';
import { User } from '../../../users/user.entity';
import { LeagueModule } from '../../league.module';
import { LeagueUser } from '../../users/league-user.entity';
import { LEAGUE_ROOM_APPLICATION_STATUS } from '../applications/league-room-applications.config';

describe('Get a league room details integration test', () => {
  let app: INestApplication;

  let user: User;
  let userGames: UserGames;
  let leagueUser: LeagueUser;

  beforeAll(async () => {
    const module = await compileTestingModule([LeagueModule]);

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

  describe('GET /league/rooms', () => {
    const getRoute = (id = faker.datatype.uuid()) =>
      `/api/v1/league/rooms/${id}`;
    it('404 - league room not found', async () => {
      const res = await makeRequest(app)
        .get(getRoute())
        .set(
          authHeaderJwt({
            id: user.id,
          }),
        );

      expect(res.status).toBe(HttpStatus.NOT_FOUND);
    });

    it('404 - league room exists but not found because user has not joined', async () => {
      const leagueRoom = await saveLeagueRoom({
        region: leagueUser.region,
      });

      const res = await makeRequest(app)
        .get(getRoute(leagueRoom.id))
        .set(
          authHeaderJwt({
            id: user.id,
          }),
        );

      expect(res.status).toBe(HttpStatus.NOT_FOUND);
    });

    it('401', async () => {
      const res = await makeRequest(app).get(getRoute()).set({
        Authorization: 'Fake',
      });

      expect(res.status).toBe(HttpStatus.UNAUTHORIZED);
    });

    it('200', async () => {
      const leagueRoom = await saveLeagueRoom({
        region: leagueUser.region,
        owner: leagueUser,
      });

      const res = await makeRequest(app)
        .get(getRoute(leagueRoom.id))
        .set(
          authHeaderJwt({
            id: user.id,
          }),
        );

      expect(res.status).toBe(HttpStatus.OK);
      expect(res.body.data).toMatchObject({
        id: leagueRoom.id,
        description: leagueRoom.description,
        region: leagueRoom.region,
        demandedPositions: leagueRoom.demandedPositions,
        currentPlayers: 1,
        requiredPlayers: 2,
      });
    });

    it('200 - as owner', async () => {
      const leagueRoom = await saveLeagueRoom({
        region: leagueUser.region,
        owner: leagueUser,
      });

      const res = await makeRequest(app)
        .get(getRoute(leagueRoom.id))
        .set(
          authHeaderJwt({
            id: user.id,
          }),
        );

      expect(res.status).toBe(HttpStatus.OK);
      expect(res.body.data).toMatchObject({
        id: leagueRoom.id,
        description: leagueRoom.description,
        region: leagueRoom.region,
        demandedPositions: leagueRoom.demandedPositions,
        currentPlayers: 1,
        requiredPlayers: 2,
      });
    });

    it('200 - as owner with a one pending application', async () => {
      const leagueRoom = await saveLeagueRoom({
        region: leagueUser.region,
        owner: leagueUser,
      });

      await saveLeagueRoomApplication({
        status: LEAGUE_ROOM_APPLICATION_STATUS.PENDING,
        room: leagueRoom,
      });

      const res = await makeRequest(app)
        .get(getRoute(leagueRoom.id))
        .set(
          authHeaderJwt({
            id: user.id,
          }),
        );

      expect(res.status).toBe(HttpStatus.OK);
      expect(res.body.data).toMatchObject({
        id: leagueRoom.id,
        description: leagueRoom.description,
        region: leagueRoom.region,
        demandedPositions: leagueRoom.demandedPositions,
        currentPlayers: 1,
        requiredPlayers: 2,
      });
    });
  });
});
