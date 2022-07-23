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
  createLeagueRoomApplication,
  getRandomApplicationStatus,
  saveLeagueRoom,
  saveLeagueUser,
} from '../../../../test/utils/league.utils';
import { saveUser } from '../../../../test/utils/user.utils';
import { UserGames } from '../../../games/userGames.entity';
import { Order } from '../../../shared/page/page.constants';
import { User } from '../../../users/user.entity';
import { LeagueModule } from '../../league.module';
import { RIOT_API_POSITIONS } from '../../riotApi/riotApi.config';
import { LeagueUser } from '../../users/league-user.entity';
import { LEAGUE_ROOM_APPLICATION_STATUS } from '../applications/league-room-applications.config';

describe('Search for league rooms integration test', () => {
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
    const getRoute = () => `/api/v1/league/rooms`;
    it('404 - no league user', async () => {
      user = await saveUser();

      const res = await makeRequest(app)
        .get(getRoute())
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
        owner: await saveLeagueUser(),
      });

      const res = await makeRequest(app)
        .get(getRoute())
        .set(
          authHeaderJwt({
            id: user.id,
          }),
        );

      expect(res.status).toBe(HttpStatus.OK);
      expect(res.body).toMatchObject({
        data: [expect.objectContaining({ id: leagueRoom.id })],
        meta: {
          page: 1,
          take: 10,
          itemCount: 1,
          pageCount: 1,
          hasPreviousPage: false,
          hasNextPage: false,
        },
      });
    });

    it('200 - with pagination', async () => {
      await Promise.all(
        Array(15)
          .fill('')
          .map(async () =>
            saveLeagueRoom({
              region: leagueUser.region,
              owner: await saveLeagueUser(),
            }),
          ),
      );

      const res = await makeRequest(app)
        .get(getRoute())
        .query({
          page: 2,
        })
        .set(
          authHeaderJwt({
            id: user.id,
          }),
        );

      expect(res.status).toBe(HttpStatus.OK);
      expect(res.body.data).toHaveLength(5);
      expect(res.body).toMatchObject({
        meta: {
          page: 2,
          take: 10,
          itemCount: 15,
          pageCount: 2,
          hasPreviousPage: true,
          hasNextPage: false,
        },
      });
    });

    describe('Found only one (depending on case)', () => {
      it('200 - found only one (1 joined)', async () => {
        const leagueRoom = await saveLeagueRoom({
          region: leagueUser.region,
          owner: await saveLeagueUser(),
        });

        await saveLeagueRoom({
          region: leagueUser.region,
          applications: [
            createLeagueRoomApplication({
              leagueUser,
              status: LEAGUE_ROOM_APPLICATION_STATUS.APPROVED,
            }),
          ],
        });

        const res = await makeRequest(app)
          .get(getRoute())
          .set(
            authHeaderJwt({
              id: user.id,
            }),
          );

        expect(res.status).toBe(HttpStatus.OK);
        expect(res.body).toMatchObject({
          data: [expect.objectContaining({ id: leagueRoom.id })],
          meta: {
            page: 1,
            take: 10,
            itemCount: 1,
            pageCount: 1,
            hasPreviousPage: false,
            hasNextPage: false,
          },
        });
      });

      it('200 - found only one (1 rejected)', async () => {
        const leagueRoom = await saveLeagueRoom({
          region: leagueUser.region,
          owner: await saveLeagueUser(),
        });

        await saveLeagueRoom({
          region: leagueUser.region,
          demandedPositions: [RIOT_API_POSITIONS.MIDDLE],
          applications: [
            createLeagueRoomApplication({
              leagueUser,
              status: LEAGUE_ROOM_APPLICATION_STATUS.REJECTED,
              appliedForPosition: RIOT_API_POSITIONS.MIDDLE,
            }),
          ],
        });

        const res = await makeRequest(app)
          .get(getRoute())
          .set(
            authHeaderJwt({
              id: user.id,
            }),
          );

        expect(res.status).toBe(HttpStatus.OK);
        expect(res.body).toMatchObject({
          data: [expect.objectContaining({ id: leagueRoom.id })],
          meta: {
            page: 1,
            take: 10,
            itemCount: 1,
            pageCount: 1,
            hasPreviousPage: false,
            hasNextPage: false,
          },
        });
      });

      it('200 - found only one (1 pending)', async () => {
        const leagueRoom = await saveLeagueRoom({
          region: leagueUser.region,
          owner: await saveLeagueUser(),
        });

        await saveLeagueRoom({
          region: leagueUser.region,
          demandedPositions: [RIOT_API_POSITIONS.TOP, RIOT_API_POSITIONS.ADC],
          applications: [
            createLeagueRoomApplication({
              leagueUser,
              status: LEAGUE_ROOM_APPLICATION_STATUS.PENDING,
              appliedForPosition: RIOT_API_POSITIONS.ADC,
            }),
          ],
        });

        const res = await makeRequest(app)
          .get(getRoute())
          .set(
            authHeaderJwt({
              id: user.id,
            }),
          );

        expect(res.status).toBe(HttpStatus.OK);
        expect(res.body).toMatchObject({
          data: [expect.objectContaining({ id: leagueRoom.id })],
          meta: {
            page: 1,
            take: 10,
            itemCount: 1,
            pageCount: 1,
            hasPreviousPage: false,
            hasNextPage: false,
          },
        });
      });

      it('200 - found only one (1 left)', async () => {
        const leagueRoom = await saveLeagueRoom({
          region: leagueUser.region,
          owner: await saveLeagueUser(),
        });

        await saveLeagueRoom({
          region: leagueUser.region,
          demandedPositions: [RIOT_API_POSITIONS.MIDDLE],
          applications: [
            createLeagueRoomApplication({
              leagueUser,
              status: LEAGUE_ROOM_APPLICATION_STATUS.LEFT,
              appliedForPosition: RIOT_API_POSITIONS.MIDDLE,
            }),
          ],
        });

        const res = await makeRequest(app)
          .get(getRoute())
          .set(
            authHeaderJwt({
              id: user.id,
            }),
          );

        expect(res.status).toBe(HttpStatus.OK);
        expect(res.body).toMatchObject({
          data: [expect.objectContaining({ id: leagueRoom.id })],
          meta: {
            page: 1,
            take: 10,
            itemCount: 1,
            pageCount: 1,
            hasPreviousPage: false,
            hasNextPage: false,
          },
        });
      });

      it('200 - found only one (1 already full)', async () => {
        const leagueRoom = await saveLeagueRoom({
          region: leagueUser.region,
          owner: await saveLeagueUser(),
        });

        await saveLeagueRoom({
          region: leagueUser.region,
          demandedPositions: [],
        });

        const pastRoom = await saveLeagueRoom({
          region: leagueUser.region,
          date: faker.date.past(),
        });

        const res = await makeRequest(app)
          .get(getRoute())
          .set(
            authHeaderJwt({
              id: user.id,
            }),
          );

        expect(res.status).toBe(HttpStatus.OK);
        expect(res.body).toMatchObject({
          data: [expect.objectContaining({ id: leagueRoom.id })],
          meta: {
            page: 1,
            take: 10,
            itemCount: 1,
            pageCount: 1,
            hasPreviousPage: false,
            hasNextPage: false,
          },
        });
      });

      it('200 - found only one (1 with the date passed)', async () => {
        const leagueRoom = await saveLeagueRoom({
          region: leagueUser.region,
          owner: await saveLeagueUser(),
        });

        await saveLeagueRoom({
          region: leagueUser.region,
          date: faker.date.past(),
          owner: await saveLeagueUser(),
        });

        const res = await makeRequest(app)
          .get(getRoute())
          .set(
            authHeaderJwt({
              id: user.id,
            }),
          );

        expect(res.status).toBe(HttpStatus.OK);
        expect(res.body).toMatchObject({
          data: [expect.objectContaining({ id: leagueRoom.id })],
          meta: {
            page: 1,
            take: 10,
            itemCount: 1,
            pageCount: 1,
            hasPreviousPage: false,
            hasNextPage: false,
          },
        });
      });
    });

    describe('Room filtering', () => {
      const invalidQueries = [
        {
          dateFrom: 'fake',
        },
        {
          dateTo: 'fake',
        },
        {
          demandedPositions: ['fake'],
        },
      ];

      it.each(invalidQueries)('422', async (invalidQuery) => {
        const res = await makeRequest(app)
          .get(getRoute())
          .query(invalidQuery)
          .set(
            authHeaderJwt({
              id: user.id,
            }),
          );
        expect(res.status).toBe(HttpStatus.UNPROCESSABLE_ENTITY);
      });

      it('200 - filtered by dateFrom', async () => {
        await saveLeagueRoom({
          region: leagueUser.region,
          date: faker.date.past(),
          owner: await saveLeagueUser(),
        });

        const futureRoom = await saveLeagueRoom({
          region: leagueUser.region,
          owner: await saveLeagueUser(),
        });

        const res = await makeRequest(app)
          .get(getRoute())
          .query({
            dateFrom: new Date(),
          })
          .set(
            authHeaderJwt({
              id: user.id,
            }),
          );

        expect(res.status).toBe(HttpStatus.OK);
        expect(res.body.data).toHaveLength(1);
        expect(res.body.data).toMatchObject([
          expect.objectContaining({ id: futureRoom.id }),
        ]);
      });

      it('200 - filtered by dateTo', async () => {
        const now = new Date();

        const closeFutureDate = new Date(now);
        closeFutureDate.setFullYear(closeFutureDate.getFullYear() + 1);

        const midFutureDate = new Date(now);
        midFutureDate.setFullYear(midFutureDate.getFullYear() + 3);

        const farFutureDate = new Date(now);
        farFutureDate.setFullYear(farFutureDate.getFullYear() + 5);

        const closeFutureRoom = await saveLeagueRoom({
          region: leagueUser.region,
          date: closeFutureDate,
          owner: await saveLeagueUser(),
        });

        await saveLeagueRoom({
          region: leagueUser.region,
          date: farFutureDate,
          owner: await saveLeagueUser(),
        });

        const res = await makeRequest(app)
          .get(getRoute())
          .query({
            dateTo: midFutureDate,
          })
          .set(
            authHeaderJwt({
              id: user.id,
            }),
          );

        expect(res.status).toBe(HttpStatus.OK);
        expect(res.body.data).toHaveLength(1);
        expect(res.body.data).toMatchObject([
          expect.objectContaining({ id: closeFutureRoom.id }),
        ]);
      });

      it('200 - filtered by demandedPositions', async () => {
        await saveLeagueRoom({
          region: leagueUser.region,
          demandedPositions: [
            RIOT_API_POSITIONS.ADC,
            RIOT_API_POSITIONS.JUNGLE,
          ],
          owner: await saveLeagueUser(),
        });

        const demandedRoom = await saveLeagueRoom({
          region: leagueUser.region,
          demandedPositions: [RIOT_API_POSITIONS.MIDDLE],
          owner: await saveLeagueUser(),
        });

        const res = await makeRequest(app)
          .get(getRoute())
          .query({
            'demandedPositions[]': [RIOT_API_POSITIONS.MIDDLE],
          })
          .set(
            authHeaderJwt({
              id: user.id,
            }),
          );

        expect(res.status).toBe(HttpStatus.OK);
        expect(res.body.data).toHaveLength(1);
        expect(res.body.data).toMatchObject([
          expect.objectContaining({ id: demandedRoom.id }),
        ]);
      });
    });

    describe('Room sorting', () => {
      it('422', async () => {
        const res = await makeRequest(app)
          .get(getRoute())
          .query({
            order: faker.datatype.string(),
          })
          .set(
            authHeaderJwt({
              id: user.id,
            }),
          );

        expect(res.status).toBe(HttpStatus.UNPROCESSABLE_ENTITY);
      });

      it('200 - ordered correctly (ASC)', async () => {
        const first = await saveLeagueRoom({
          region: leagueUser.region,
          date: faker.date.soon(),
          owner: await saveLeagueUser(),
        });

        const second = await saveLeagueRoom({
          region: leagueUser.region,
          date: faker.date.future(),
          owner: await saveLeagueUser(),
        });

        const res = await makeRequest(app)
          .get(getRoute())
          .query({
            order: Order.ASC,
          })
          .set(
            authHeaderJwt({
              id: user.id,
            }),
          );

        expect(res.status).toBe(HttpStatus.OK);
        expect(res.body.data).toHaveLength(2);
        expect(res.body.data).toMatchObject([
          expect.objectContaining({ id: first.id }),
          expect.objectContaining({ id: second.id }),
        ]);
      });

      it('200 - ordered correctly (DESC)', async () => {
        const second = await saveLeagueRoom({
          region: leagueUser.region,
          date: faker.date.soon(),
          owner: await saveLeagueUser(),
        });

        const first = await saveLeagueRoom({
          region: leagueUser.region,
          date: faker.date.future(),
          owner: await saveLeagueUser(),
        });

        const res = await makeRequest(app)
          .get(getRoute())
          .query({
            order: Order.DESC,
          })
          .set(
            authHeaderJwt({
              id: user.id,
            }),
          );

        expect(res.status).toBe(HttpStatus.OK);
        expect(res.body.data).toHaveLength(2);
        expect(res.body.data).toMatchObject([
          expect.objectContaining({ id: first.id }),
          expect.objectContaining({ id: second.id }),
        ]);
      });
    });
  });

  describe('GET /league/rooms/me', () => {
    const getRoute = () => `/api/v1/league/rooms/me`;

    const invalidQueries = [
      {
        page: faker.datatype.string(),
        status: getRandomApplicationStatus(),
      },
      {
        take: faker.datatype.string(),
        status: getRandomApplicationStatus(),
      },
      {
        order: faker.datatype.string(),
        status: getRandomApplicationStatus(),
      },
      {
        status: faker.datatype.string(),
      },
    ];
    it('404 - no league user', async () => {
      user = await saveUser();

      const res = await makeRequest(app)
        .get(getRoute())
        .query({
          status: getRandomApplicationStatus(),
        })
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

    it('Should return joined rooms', async () => {
      await saveLeagueRoom({
        region: leagueUser.region,
      });

      const joinedRoom = await saveLeagueRoom({
        region: leagueUser.region,
        applications: [
          createLeagueRoomApplication({
            leagueUser,
            status: LEAGUE_ROOM_APPLICATION_STATUS.APPROVED,
          }),
        ],
      });

      const res = await makeRequest(app)
        .get(getRoute())
        .query({
          status: LEAGUE_ROOM_APPLICATION_STATUS.APPROVED,
        })
        .set(
          authHeaderJwt({
            id: user.id,
          }),
        );

      expect(res.status).toBe(HttpStatus.OK);
      expect(res.body.data).toHaveLength(1);
      expect(res.body).toMatchObject({
        data: [expect.objectContaining({ id: joinedRoom.id })],
        meta: {
          page: 1,
          take: 10,
          itemCount: 1,
          pageCount: 1,
          hasPreviousPage: false,
          hasNextPage: false,
        },
      });
    });

    it('Should return rejected rooms', async () => {
      await saveLeagueRoom({
        region: leagueUser.region,
        owner: await saveLeagueUser(),
      });

      const rejectedRoom = await saveLeagueRoom({
        region: leagueUser.region,
        applications: [
          createLeagueRoomApplication({
            leagueUser,
            status: LEAGUE_ROOM_APPLICATION_STATUS.REJECTED,
          }),
        ],
        owner: await saveLeagueUser(),
      });

      const res = await makeRequest(app)
        .get(getRoute())
        .query({
          status: LEAGUE_ROOM_APPLICATION_STATUS.REJECTED,
        })
        .set(
          authHeaderJwt({
            id: user.id,
          }),
        );

      expect(res.status).toBe(HttpStatus.OK);
      expect(res.body.data).toHaveLength(1);
      expect(res.body).toMatchObject({
        data: [expect.objectContaining({ id: rejectedRoom.id })],
        meta: {
          page: 1,
          take: 10,
          itemCount: 1,
          pageCount: 1,
          hasPreviousPage: false,
          hasNextPage: false,
        },
      });
    });

    it('Should return pending rooms', async () => {
      await saveLeagueRoom({
        region: leagueUser.region,
        owner: await saveLeagueUser(),
      });

      const pendingRoom1 = await saveLeagueRoom({
        region: leagueUser.region,
        applications: [
          createLeagueRoomApplication({
            leagueUser,
            status: LEAGUE_ROOM_APPLICATION_STATUS.PENDING,
          }),
        ],
        owner: await saveLeagueUser(),
      });

      const pendingRoom2 = await saveLeagueRoom({
        region: leagueUser.region,
        applications: [
          createLeagueRoomApplication({
            leagueUser,
            status: LEAGUE_ROOM_APPLICATION_STATUS.PENDING,
          }),
        ],
        owner: await saveLeagueUser(),
      });

      const res = await makeRequest(app)
        .get(getRoute())
        .query({
          status: LEAGUE_ROOM_APPLICATION_STATUS.PENDING,
        })
        .set(
          authHeaderJwt({
            id: user.id,
          }),
        );

      expect(res.status).toBe(HttpStatus.OK);
      expect(res.body.data).toHaveLength(2);
      expect(res.body).toMatchObject({
        data: expect.arrayContaining([
          expect.objectContaining({ id: pendingRoom1.id }),
          expect.objectContaining({ id: pendingRoom2.id }),
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

    it('Should return left rooms', async () => {
      await saveLeagueRoom({
        region: leagueUser.region,
        owner: await saveLeagueUser(),
      });

      const leftRoom = await saveLeagueRoom({
        region: leagueUser.region,
        applications: [
          createLeagueRoomApplication({
            leagueUser,
            status: LEAGUE_ROOM_APPLICATION_STATUS.LEFT,
          }),
        ],
        owner: await saveLeagueUser(),
      });

      const res = await makeRequest(app)
        .get(getRoute())
        .query({
          status: LEAGUE_ROOM_APPLICATION_STATUS.LEFT,
        })
        .set(
          authHeaderJwt({
            id: user.id,
          }),
        );

      expect(res.status).toBe(HttpStatus.OK);
      expect(res.body.data).toHaveLength(1);
      expect(res.body).toMatchObject({
        data: [expect.objectContaining({ id: leftRoom.id })],
        meta: {
          page: 1,
          take: 10,
          itemCount: 1,
          pageCount: 1,
          hasPreviousPage: false,
          hasNextPage: false,
        },
      });
    });
  });
});
