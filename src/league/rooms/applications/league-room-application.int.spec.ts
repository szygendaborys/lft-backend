import { HttpStatus, INestApplication } from '@nestjs/common';
import * as faker from 'faker';
import { getRepository } from 'typeorm';
import {
  authHeaderJwt,
  clearSchema,
  compileTestingModule,
  init,
  makeRequest,
} from '../../../../test/test.module';
import { saveUserGames } from '../../../../test/utils/games.utils';
import {
  getRandomApplicationStatus,
  saveLeagueRoom,
  saveLeagueRoomApplication,
  saveLeagueUser,
} from '../../../../test/utils/league.utils';
import { randomEnum } from '../../../../test/utils/test.utils';
import { saveUser } from '../../../../test/utils/user.utils';
import { UserGames } from '../../../games/userGames.entity';
import { User } from '../../../users/user.entity';
import { LeagueModule } from '../../league.module';
import {
  RIOT_API_POSITIONS,
  RIOT_API_REGIONS,
} from '../../riotApi/riotApi.config';
import { LeagueUser } from '../../users/league-user.entity';
import { LeagueRoomApplication } from './league-room-application.entity';
import { LEAGUE_ROOM_APPLICATION_STATUS } from './league-room-applications.config';

describe('League room application integration tests', () => {
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

  describe('POST - apply for a room', () => {
    const getRoute = (roomId = faker.datatype.uuid()) =>
      `/api/v1/league/rooms/${roomId}/applications`;

    const invalidPayloads = [
      {
        demandedPosition: faker.datatype.string(),
      },
      {},
      undefined,
    ];

    it.each(invalidPayloads)('422', async (invalidPayload) => {
      const res = await makeRequest(app)
        .post(getRoute())
        .set(
          authHeaderJwt({
            id: user.id,
          }),
        )
        .send(invalidPayload);

      expect(res.status).toBe(HttpStatus.UNPROCESSABLE_ENTITY);
    });

    it('404', async () => {
      const res = await makeRequest(app)
        .post(getRoute())
        .set(
          authHeaderJwt({
            id: user.id,
          }),
        )
        .send({
          demandedPosition: randomEnum(RIOT_API_POSITIONS),
        });

      expect(res.status).toBe(HttpStatus.NOT_FOUND);
    });

    it('404 - no user league', async () => {
      user = await saveUser();

      const res = await makeRequest(app)
        .post(getRoute())
        .set(
          authHeaderJwt({
            id: user.id,
          }),
        )
        .send({
          demandedPosition: randomEnum(RIOT_API_POSITIONS),
        });

      expect(res.status).toBe(HttpStatus.NOT_FOUND);
    });

    it('404 - league room already started', async () => {
      const leagueRoom = await saveLeagueRoom({
        region: leagueUser.region,
        date: faker.date.past(),
        owner: await saveLeagueUser(),
      });

      const res = await makeRequest(app)
        .post(getRoute(leagueRoom.id))
        .set(
          authHeaderJwt({
            id: user.id,
          }),
        )
        .send({
          demandedPosition: randomEnum(RIOT_API_POSITIONS),
        });

      expect(res.status).toBe(HttpStatus.NOT_FOUND);
    });

    it('404 - league room from the other region', async () => {
      user = await saveUser();
      userGames = await saveUserGames({ user });
      leagueUser = await saveLeagueUser({
        userGames,
        region: RIOT_API_REGIONS.BR1,
      });

      const leagueRoom = await saveLeagueRoom({
        region: RIOT_API_REGIONS.EUNE,
        owner: await saveLeagueUser(),
      });

      const res = await makeRequest(app)
        .post(getRoute(leagueRoom.id))
        .set(
          authHeaderJwt({
            id: user.id,
          }),
        )
        .send({
          demandedPosition: randomEnum(RIOT_API_POSITIONS),
        });

      expect(res.status).toBe(HttpStatus.NOT_FOUND);
    });

    it('401', async () => {
      const res = await makeRequest(app).post(getRoute()).set({
        Authorization: 'Fake',
      });

      expect(res.status).toBe(HttpStatus.UNAUTHORIZED);
    });

    it('400 - unavailable position', async () => {
      const leagueRoom = await saveLeagueRoom({
        region: leagueUser.region,
        demandedPositions: [RIOT_API_POSITIONS.ADC],
        owner: await saveLeagueUser(),
      });

      const res = await makeRequest(app)
        .post(getRoute(leagueRoom.id))
        .set(
          authHeaderJwt({
            id: user.id,
          }),
        )
        .send({
          demandedPosition: RIOT_API_POSITIONS.MIDDLE,
        });

      expect(res.status).toBe(HttpStatus.BAD_REQUEST);
    });

    it('400 - unavailable position', async () => {
      const leagueRoom = await saveLeagueRoom({
        region: leagueUser.region,
        demandedPositions: [],
        owner: await saveLeagueUser(),
      });

      const res = await makeRequest(app)
        .post(getRoute(leagueRoom.id))
        .set(
          authHeaderJwt({
            id: user.id,
          }),
        )
        .send({
          demandedPosition: RIOT_API_POSITIONS.ADC,
        });

      expect(res.status).toBe(HttpStatus.BAD_REQUEST);
    });

    it('201', async () => {
      const leagueRoom = await saveLeagueRoom({
        region: leagueUser.region,
        demandedPositions: [RIOT_API_POSITIONS.MIDDLE],
        owner: await saveLeagueUser(),
      });

      const res = await makeRequest(app)
        .post(getRoute(leagueRoom.id))
        .set(
          authHeaderJwt({
            id: user.id,
          }),
        )
        .send({
          demandedPosition: RIOT_API_POSITIONS.MIDDLE,
        });

      const savedApplication = await getRepository(
        LeagueRoomApplication,
      ).findOne({
        where: {
          leagueUser,
          room: leagueRoom,
        },
      });

      expect(res.status).toBe(HttpStatus.CREATED);
      expect(savedApplication).toBeDefined();
      expect(res.body.data).toMatchObject({
        id: savedApplication.id,
      });
    });

    it('201 - persisted previous applications', async () => {
      const leagueRoom = await saveLeagueRoom({
        region: leagueUser.region,
        demandedPositions: [RIOT_API_POSITIONS.MIDDLE],
        owner: await saveLeagueUser(),
      });

      const res = await makeRequest(app)
        .post(getRoute(leagueRoom.id))
        .set(
          authHeaderJwt({
            id: user.id,
          }),
        )
        .send({
          demandedPosition: RIOT_API_POSITIONS.MIDDLE,
        });

      const totalApplications = await getRepository(
        LeagueRoomApplication,
      ).count({
        where: {
          room: leagueRoom,
        },
      });

      expect(res.status).toBe(HttpStatus.CREATED);
      expect(totalApplications).toBe(2);
    });
  });

  describe('GET - room applications', () => {
    const getRoute = (roomId = faker.datatype.uuid()) =>
      `/api/v1/league/rooms/${roomId}/applications`;

    it('422 invalid query status', async () => {
      const leagueRoom = await saveLeagueRoom({
        region: RIOT_API_REGIONS.EUNE,
        owner: leagueUser,
      });

      const res = await makeRequest(app)
        .get(getRoute(leagueRoom.id))
        .query({ status: faker.datatype.string() })
        .set(
          authHeaderJwt({
            id: user.id,
          }),
        );

      expect(res.status).toBe(HttpStatus.UNPROCESSABLE_ENTITY);
    });
    it('404 - no user league', async () => {
      user = await saveUser();

      const res = await makeRequest(app)
        .get(getRoute())
        .query({ status: getRandomApplicationStatus() })
        .set(
          authHeaderJwt({
            id: user.id,
          }),
        );

      expect(res.status).toBe(HttpStatus.NOT_FOUND);
    });

    it('403', async () => {
      user = await saveUser();
      userGames = await saveUserGames({ user });
      leagueUser = await saveLeagueUser({
        userGames,
        region: RIOT_API_REGIONS.BR1,
      });

      const leagueRoom = await saveLeagueRoom({
        region: RIOT_API_REGIONS.EUNE,
        owner: await saveLeagueUser(),
      });

      const res = await makeRequest(app)
        .get(getRoute(leagueRoom.id))
        .query({ status: getRandomApplicationStatus() })
        .set(
          authHeaderJwt({
            id: user.id,
          }),
        );

      expect(res.status).toBe(HttpStatus.FORBIDDEN);
    });

    it('401', async () => {
      const res = await makeRequest(app)
        .get(getRoute())
        .query({ status: randomEnum(LEAGUE_ROOM_APPLICATION_STATUS) })
        .set({
          Authorization: 'Fake',
        });

      expect(res.status).toBe(HttpStatus.UNAUTHORIZED);
    });

    it.each([
      LEAGUE_ROOM_APPLICATION_STATUS.REJECTED,
      LEAGUE_ROOM_APPLICATION_STATUS.PENDING,
      LEAGUE_ROOM_APPLICATION_STATUS.LEFT,
      LEAGUE_ROOM_APPLICATION_STATUS.APPROVED,
    ])('200 - joined applications one found of each', async (status) => {
      const leagueRoom = await saveLeagueRoom({
        region: leagueUser.region,
        owner: leagueUser,
      });

      await saveLeagueRoomApplication({
        status: LEAGUE_ROOM_APPLICATION_STATUS.PENDING,
        room: leagueRoom,
      });
      await saveLeagueRoomApplication({
        status: LEAGUE_ROOM_APPLICATION_STATUS.LEFT,
        room: leagueRoom,
      });
      await saveLeagueRoomApplication({
        status: LEAGUE_ROOM_APPLICATION_STATUS.REJECTED,
        room: leagueRoom,
      });

      const res = await makeRequest(app)
        .get(getRoute(leagueRoom.id))
        .query({ status })
        .set(
          authHeaderJwt({
            id: user.id,
          }),
        );

      expect(res.status).toBe(HttpStatus.OK);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.data[0]).toMatchObject({
        status,
      });
    });
  });
});
