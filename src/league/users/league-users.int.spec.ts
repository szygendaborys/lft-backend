import { HttpStatus, INestApplication } from '@nestjs/common';
import * as faker from 'faker';
import { getConnection, getRepository } from 'typeorm';
import {
  authHeaderJwt,
  clearSchema,
  compileTestingModule,
  init,
  makeRequest,
  TO_PROMISE,
} from '../../../test/test.module';
import { saveUserGames } from '../../../test/utils/games.utils';
import { saveLeagueUser } from '../../../test/utils/league.utils';
import {
  createRandomRiotApiException,
  createRiotLeaguePlayerData,
} from '../../../test/utils/riotApi.utils';
import { RolesChecker } from '../../../test/utils/roles.utils';
import { randomEnum } from '../../../test/utils/test.utils';
import { saveUser } from '../../../test/utils/user.utils';
import { UserGames } from '../../games/userGames.entity';
import { Roles } from '../../roles/roles.config';
import { LeagueModule } from '../league.module';
import {
  RIOT_API_POSITIONS,
  RIOT_API_REGIONS,
} from '../riotApi/riotApi.config';
import { RiotApiService } from '../riotApi/riotApi.service';
import { LeagueUser } from './league-user.entity';

describe('League users integration tests', () => {
  let app: INestApplication;
  let riotApiService: RiotApiService;
  let toPromise: jest.Mock;
  let rolesChecker: RolesChecker;

  beforeAll(async () => {
    const module = await compileTestingModule([LeagueModule]);

    app = await init(module);

    riotApiService = app.get<RiotApiService>(RiotApiService);
    rolesChecker = app.get<RolesChecker>(RolesChecker);
    toPromise = module.get(TO_PROMISE);
  });

  beforeEach(async () => {
    jest.resetAllMocks();
    jest.spyOn(rolesChecker, 'check').mockRestore();
    await clearSchema();
  });

  afterAll(async () => {
    await app.close();
  });
  describe(`POST /api/v1/league/users`, () => {
    const getRoute = () => `/api/v1/league/users`;
    const invalidPayloads = [
      {
        summonerName: faker.datatype.string(),
        region: faker.datatype.string(),
        mainPosition: RIOT_API_POSITIONS.JUNGLE,
        secondaryPosition: RIOT_API_POSITIONS.MIDDLE,
      },
      {
        summonerName: faker.datatype.number(),
        region: randomEnum(RIOT_API_REGIONS),
        mainPosition: RIOT_API_POSITIONS.JUNGLE,
        secondaryPosition: RIOT_API_POSITIONS.MIDDLE,
      },
      {
        summonerName: faker.datatype.string(),
        region: randomEnum(RIOT_API_REGIONS),
        mainPosition: faker.datatype.string(),
        secondaryPosition: RIOT_API_POSITIONS.MIDDLE,
      },
      {
        summonerName: faker.datatype.string(),
        region: randomEnum(RIOT_API_REGIONS),
        mainPosition: RIOT_API_POSITIONS.JUNGLE,
        secondaryPosition: faker.datatype.string(),
      },
    ];

    it('Should have been called with appropriate roles', async () => {
      const user = await saveUser();

      jest.spyOn(rolesChecker, 'check');

      await makeRequest(app)
        .post(getRoute())
        .set(
          authHeaderJwt({
            id: user.id,
          }),
        );

      expect(rolesChecker.check).toHaveBeenCalledWith(Roles.USER, Roles.USER);
    });

    it('503 - Riot api not available', async () => {
      const user = await saveUser();
      const given = {
        summonerName: faker.datatype.string(),
        region: randomEnum(RIOT_API_REGIONS),
        mainPosition: RIOT_API_POSITIONS.ADC,
        secondaryPosition: RIOT_API_POSITIONS.JUNGLE,
      };

      toPromise.mockRejectedValueOnce(createRandomRiotApiException());

      const res = await makeRequest(app)
        .post(getRoute())
        .set(
          authHeaderJwt({
            id: user.id,
          }),
        )
        .send(given);

      expect(res.status).toBe(HttpStatus.SERVICE_UNAVAILABLE);
    });

    it.each(invalidPayloads)('422', async () => {
      const user = await saveUser();
      const res = await makeRequest(app)
        .post(getRoute())
        .set(
          authHeaderJwt({
            id: user.id,
          }),
        );
      expect(res.status).toBe(HttpStatus.UNPROCESSABLE_ENTITY);
    });

    it('404', async () => {
      const user = await saveUser();

      jest
        .spyOn(riotApiService, 'fetchAccount')
        .mockResolvedValueOnce(createRiotLeaguePlayerData());

      const res = await makeRequest(app)
        .post(getRoute())
        .set(
          authHeaderJwt({
            id: user.id,
          }),
        )
        .send({
          summonerName: faker.datatype.string(),
          region: randomEnum(RIOT_API_REGIONS),
          mainPosition: RIOT_API_POSITIONS.JUNGLE,
          secondaryPosition: RIOT_API_POSITIONS.ADC,
        });

      expect(res.status).toBe(HttpStatus.NOT_FOUND);
    });

    it('401', async () => {
      const res = await makeRequest(app)
        .post(getRoute())
        .set(
          authHeaderJwt({
            id: faker.datatype.uuid(),
          }),
        );

      expect(res.status).toBe(HttpStatus.UNAUTHORIZED);
    });

    it('400 - duplicated position', async () => {
      const user = await saveUser();
      const given = {
        summonerName: faker.datatype.string(),
        region: randomEnum(RIOT_API_REGIONS),
        mainPosition: RIOT_API_POSITIONS.JUNGLE,
        secondaryPosition: RIOT_API_POSITIONS.JUNGLE,
      };

      jest
        .spyOn(riotApiService, 'fetchAccount')
        .mockResolvedValueOnce(createRiotLeaguePlayerData());

      const res = await makeRequest(app)
        .post(getRoute())
        .set(
          authHeaderJwt({
            id: user.id,
          }),
        )
        .send(given);

      expect(res.status).toBe(HttpStatus.BAD_REQUEST);
    });

    it('400 - already created', async () => {
      const user = await saveUser();
      const leagueUser = await saveLeagueUser();

      await saveUserGames({
        user,
        league_of_legends: leagueUser,
      });

      const given = {
        summonerName: faker.datatype.string(),
        region: randomEnum(RIOT_API_REGIONS),
        mainPosition: RIOT_API_POSITIONS.JUNGLE,
        secondaryPosition: RIOT_API_POSITIONS.ADC,
      };

      jest
        .spyOn(riotApiService, 'fetchAccount')
        .mockResolvedValueOnce(createRiotLeaguePlayerData());

      const res = await makeRequest(app)
        .post(getRoute())
        .set(
          authHeaderJwt({
            id: user.id,
          }),
        )
        .send(given);

      expect(res.status).toBe(HttpStatus.BAD_REQUEST);
    });

    it('201', async () => {
      const user = await saveUser();
      await saveUserGames({ user });
      const given = {
        summonerName: faker.datatype.string(),
        region: randomEnum(RIOT_API_REGIONS),
        mainPosition: RIOT_API_POSITIONS.ADC,
        secondaryPosition: RIOT_API_POSITIONS.JUNGLE,
      };
      const riotPlayerResponse = createRiotLeaguePlayerData();

      jest
        .spyOn(riotApiService, 'fetchAccount')
        .mockResolvedValueOnce(riotPlayerResponse);

      const res = await makeRequest(app)
        .post(getRoute())
        .set(
          authHeaderJwt({
            id: user.id,
          }),
        )
        .send(given);

      const savedEntry = await getConnection()
        .getRepository(UserGames)
        .findOne({ relations: ['league_of_legends', 'user'] });

      expect(res.status).toBe(HttpStatus.CREATED);
      expect(savedEntry).toMatchObject({
        user: expect.objectContaining({
          id: user.id,
        }),
        league_of_legends: {
          summonerId: riotPlayerResponse.accountId,
          region: given.region,
          mainPosition: given.mainPosition,
          secondaryPosition: given.secondaryPosition,
        },
      });
    });
  });

  describe(`PATCH /api/v1/league/users/me`, () => {
    const getRoute = () => `/api/v1/league/users/me`;

    const invalidPayloads = [
      {
        summonerName: faker.datatype.string(),
        region: faker.datatype.string(),
        mainPosition: RIOT_API_POSITIONS.JUNGLE,
        secondaryPosition: RIOT_API_POSITIONS.MIDDLE,
      },
      {
        summonerName: faker.datatype.number(),
        region: randomEnum(RIOT_API_REGIONS),
        mainPosition: RIOT_API_POSITIONS.JUNGLE,
        secondaryPosition: RIOT_API_POSITIONS.MIDDLE,
      },
      {
        summonerName: faker.datatype.string(),
        region: randomEnum(RIOT_API_REGIONS),
        mainPosition: faker.datatype.string(),
        secondaryPosition: RIOT_API_POSITIONS.MIDDLE,
      },
      {
        summonerName: faker.datatype.string(),
        region: randomEnum(RIOT_API_REGIONS),
        mainPosition: RIOT_API_POSITIONS.JUNGLE,
        secondaryPosition: faker.datatype.string(),
      },
    ];

    it('Should have been called with appropriate roles', async () => {
      const user = await saveUser();

      jest.spyOn(rolesChecker, 'check');

      await makeRequest(app)
        .patch(getRoute())
        .set(
          authHeaderJwt({
            id: user.id,
          }),
        );

      expect(rolesChecker.check).toHaveBeenCalledWith(Roles.USER, Roles.USER);
    });

    it('503 - Riot api not available', async () => {
      const user = await saveUser();
      const userGames = await saveUserGames({ user });
      await saveLeagueUser({ userGames });

      const given = {
        summonerName: faker.datatype.string(),
        region: randomEnum(RIOT_API_REGIONS),
        mainPosition: RIOT_API_POSITIONS.ADC,
        secondaryPosition: RIOT_API_POSITIONS.JUNGLE,
      };

      toPromise.mockRejectedValueOnce(createRandomRiotApiException());

      const res = await makeRequest(app)
        .patch(getRoute())
        .set(
          authHeaderJwt({
            id: user.id,
          }),
        )
        .send(given);

      expect(res.status).toBe(HttpStatus.SERVICE_UNAVAILABLE);
    });

    it.each(invalidPayloads)('422', async () => {
      const user = await saveUser();
      const res = await makeRequest(app)
        .patch(getRoute())
        .set(
          authHeaderJwt({
            id: user.id,
          }),
        );
      expect(res.status).toBe(HttpStatus.UNPROCESSABLE_ENTITY);
    });

    it('404', async () => {
      const user = await saveUser();

      jest
        .spyOn(riotApiService, 'fetchAccountBySummonerId')
        .mockResolvedValueOnce(createRiotLeaguePlayerData());

      const res = await makeRequest(app)
        .patch(getRoute())
        .set(
          authHeaderJwt({
            id: user.id,
          }),
        )
        .send({
          summonerName: faker.datatype.string(),
          region: randomEnum(RIOT_API_REGIONS),
          mainPosition: RIOT_API_POSITIONS.JUNGLE,
          secondaryPosition: RIOT_API_POSITIONS.ADC,
        });

      expect(res.status).toBe(HttpStatus.NOT_FOUND);
    });

    it('401', async () => {
      const res = await makeRequest(app)
        .patch(getRoute())
        .set(
          authHeaderJwt({
            id: faker.datatype.uuid(),
          }),
        );

      expect(res.status).toBe(HttpStatus.UNAUTHORIZED);
    });

    it('400 - duplicated position', async () => {
      const user = await saveUser();
      const userGames = await saveUserGames({ user });

      await saveLeagueUser({ userGames });

      const given = {
        summonerName: faker.datatype.string(),
        region: randomEnum(RIOT_API_REGIONS),
        mainPosition: RIOT_API_POSITIONS.JUNGLE,
        secondaryPosition: RIOT_API_POSITIONS.JUNGLE,
      };

      jest
        .spyOn(riotApiService, 'fetchAccountBySummonerId')
        .mockResolvedValueOnce(createRiotLeaguePlayerData());

      const res = await makeRequest(app)
        .patch(getRoute())
        .set(
          authHeaderJwt({
            id: user.id,
          }),
        )
        .send(given);

      expect(res.status).toBe(HttpStatus.BAD_REQUEST);
    });

    it('204', async () => {
      const user = await saveUser();
      const userGames = await saveUserGames({ user });

      await saveLeagueUser({ userGames });

      const given = {
        summonerName: faker.datatype.string(),
        region: randomEnum(RIOT_API_REGIONS),
        mainPosition: RIOT_API_POSITIONS.ADC,
        secondaryPosition: RIOT_API_POSITIONS.JUNGLE,
      };
      const riotPlayerResponse = createRiotLeaguePlayerData();

      jest
        .spyOn(riotApiService, 'fetchAccountBySummonerId')
        .mockResolvedValueOnce(riotPlayerResponse);

      const res = await makeRequest(app)
        .patch(getRoute())
        .set(
          authHeaderJwt({
            id: user.id,
          }),
        )
        .send(given);

      const savedEntry = await getConnection()
        .getRepository(UserGames)
        .findOne({ relations: ['league_of_legends', 'user'] });

      expect(res.status).toBe(HttpStatus.NO_CONTENT);
      expect(savedEntry).toMatchObject({
        user: expect.objectContaining({
          id: user.id,
        }),
        league_of_legends: {
          summonerId: riotPlayerResponse.accountId,
          region: given.region,
          mainPosition: given.mainPosition,
          secondaryPosition: given.secondaryPosition,
        },
      });
    });
  });

  describe('DELETE /api/v1/league/users/me', () => {
    const getRoute = () => `/api/v1/league/users/me`;

    it('Should have been called with appropriate roles', async () => {
      const user = await saveUser();

      jest.spyOn(rolesChecker, 'check');

      await makeRequest(app)
        .delete(getRoute())
        .set(
          authHeaderJwt({
            id: user.id,
          }),
        );

      expect(rolesChecker.check).toHaveBeenCalledWith(Roles.USER, Roles.USER);
    });

    it('404', async () => {
      const user = await saveUser();

      const res = await makeRequest(app)
        .delete(getRoute())
        .set(
          authHeaderJwt({
            id: user.id,
          }),
        );

      expect(res.status).toBe(HttpStatus.NOT_FOUND);
    });

    it('401', async () => {
      const res = await makeRequest(app)
        .delete(getRoute())
        .set(
          authHeaderJwt({
            id: faker.datatype.uuid(),
          }),
        );

      expect(res.status).toBe(HttpStatus.UNAUTHORIZED);
    });

    it('204', async () => {
      const user = await saveUser();
      const userGames = await saveUserGames({ user });
      await saveLeagueUser({ userGames });

      const res = await makeRequest(app)
        .delete(getRoute())
        .set(
          authHeaderJwt({
            id: user.id,
          }),
        );

      const deletedEntry = await getConnection()
        .getRepository(LeagueUser)
        .findOne();

      const persistedUserGames = await getRepository(UserGames).findOne({
        relations: ['user', 'league_of_legends'],
      });

      expect(res.status).toBe(HttpStatus.NO_CONTENT);
      expect(deletedEntry).toBeUndefined();
      expect(persistedUserGames).toMatchObject({
        user: expect.objectContaining({
          id: user.id,
        }),
        league_of_legends: null,
      });
    });
  });
});
