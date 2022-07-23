import { HttpStatus, INestApplication } from '@nestjs/common';
import * as faker from 'faker';
import { Connection } from 'typeorm';
import {
  authHeaderJwt,
  compileTestingModule,
  init,
  makeRequest,
  TO_PROMISE,
} from '../../../test/test.module';
import {
  createRandomRiotApiException,
  createRiotLeaguePlayerData,
  createRiotLeaguePlayerRankedData,
} from '../../../test/utils/riotApi.utils';
import { randomEnum } from '../../../test/utils/test.utils';
import { saveUser } from '../../../test/utils/user.utils';
import { User } from '../../users/user.entity';
import { LeagueModule } from '../league.module';
import { RIOT_API_QUEUE_TYPES, RIOT_API_REGIONS } from './riotApi.config';

describe('Riot API int tests', () => {
  let app: INestApplication;
  let connection: Connection;
  let toPromise: jest.Mock;

  const ROUTE = '/api/v1/riot_api';
  const endpoints = [
    `/${randomEnum(RIOT_API_REGIONS)}/${faker.internet.userName()}`,
    `/ranked/${randomEnum(RIOT_API_REGIONS)}/${faker.internet.userName()}`,
  ];

  beforeAll(async () => {
    const module = await compileTestingModule([LeagueModule]);

    app = await init(module);
    connection = module.get<Connection>(Connection);
    toPromise = module.get(TO_PROMISE);
  });

  afterAll(async () => {
    await app.close();
  });

  afterEach(async () => {
    await connection.createQueryBuilder().delete().from(User).execute();
  });
  it.each(endpoints)('503', async (endpoint: string) => {
    const user = await saveUser();

    toPromise.mockRejectedValueOnce(createRandomRiotApiException());

    const res = await makeRequest(app)
      .get(`${ROUTE}${endpoint}`)
      .set(
        authHeaderJwt({
          id: user.id,
        }),
      );

    expect(res.status).toBe(HttpStatus.SERVICE_UNAVAILABLE);
  });

  it.each(endpoints)('422', async (endpoint: string) => {
    const user = await saveUser();
    toPromise.mockRejectedValueOnce({
      response: {
        data: {
          status: {
            message: faker.random.word(),
            status_code: 422,
          },
        },
      },
    });

    const res = await makeRequest(app)
      .get(`${ROUTE}${endpoint}`)
      .set(
        authHeaderJwt({
          id: user.id,
        }),
      );

    expect(res.status).toBe(HttpStatus.UNPROCESSABLE_ENTITY);
  });

  it.each(endpoints)('404', async (endpoint: string) => {
    const user = await saveUser();
    toPromise.mockRejectedValueOnce({
      response: {
        data: {
          status: {
            message: faker.random.word(),
            status_code: 404,
          },
        },
      },
    });

    const res = await makeRequest(app)
      .get(`${ROUTE}${endpoint}`)
      .set(
        authHeaderJwt({
          id: user.id,
        }),
      );

    expect(res.status).toBe(HttpStatus.NOT_FOUND);
  });

  it.each(endpoints)('503', async (endpoint: string) => {
    const user = await saveUser();
    toPromise.mockRejectedValueOnce({});

    const res = await makeRequest(app)
      .get(`${ROUTE}${endpoint}`)
      .set(
        authHeaderJwt({
          id: user.id,
        }),
      );

    expect(res.status).toBe(HttpStatus.SERVICE_UNAVAILABLE);
  });

  describe('GET player from Riot API', () => {
    it('200', async () => {
      const player = createRiotLeaguePlayerData();
      toPromise.mockResolvedValueOnce({ data: player });

      const res = await makeRequest(app).get(
        `${ROUTE}/${randomEnum(RIOT_API_REGIONS)}/${faker.internet.userName()}`,
      );

      expect(res.status).toBe(HttpStatus.OK);
      expect(res.body.data).toMatchObject({
        id: player.id,
        accountId: player.accountId,
        puuid: player.puuid,
        name: player.name,
        profileIconId: player.profileIconId,
        revisionDate: player.revisionDate,
        summonerLevel: player.summonerLevel,
      });
    });
  });

  describe('GET ranked data from Riot API', () => {
    it('401', async () => {
      const res = await makeRequest(app).get(
        `${ROUTE}/ranked/${randomEnum(
          RIOT_API_REGIONS,
        )}/${faker.internet.userName()}`,
      );

      expect(res.status).toBe(HttpStatus.UNAUTHORIZED);
    });

    it('401 - fake user', async () => {
      const res = await makeRequest(app)
        .get(
          `${ROUTE}/ranked/${randomEnum(
            RIOT_API_REGIONS,
          )}/${faker.internet.userName()}`,
        )
        .set(
          authHeaderJwt({
            id: faker.datatype.uuid(),
          }),
        );

      expect(res.status).toBe(HttpStatus.UNAUTHORIZED);
    });
    it('200', async () => {
      const user = await saveUser();
      const flex = createRiotLeaguePlayerRankedData({
        queueType: RIOT_API_QUEUE_TYPES.RANKED_FLEX,
      });
      toPromise.mockResolvedValueOnce({ data: [flex] });

      const res = await makeRequest(app)
        .get(
          `${ROUTE}/ranked/${randomEnum(
            RIOT_API_REGIONS,
          )}/${faker.internet.userName()}`,
        )
        .set(
          authHeaderJwt({
            id: user.id,
          }),
        );

      expect(res.status).toBe(HttpStatus.OK);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.data).toMatchObject(
        expect.arrayContaining([
          {
            leagueId: flex.leagueId,
            queueType: RIOT_API_QUEUE_TYPES.RANKED_FLEX,
            tier: flex.tier,
            rank: flex.rank,
            summonerId: flex.summonerId,
            summonerName: flex.summonerName,
            leaguePoints: flex.leaguePoints,
            wins: flex.wins,
            losses: flex.losses,
            veteran: flex.veteran,
            inactive: flex.inactive,
            freshBlood: flex.freshBlood,
            hotStreak: flex.hotStreak,
          },
        ]),
      );
    });
  });
});
