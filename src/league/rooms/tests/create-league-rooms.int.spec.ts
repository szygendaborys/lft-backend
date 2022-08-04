import { HttpStatus, INestApplication } from '@nestjs/common';
import { getRepository } from 'typeorm';
import {
  authHeaderJwt,
  clearSchema,
  compileTestingModule,
  init,
  makeRequest,
} from '../../../../test/test.module';
import { saveUserGames } from '../../../../test/utils/games.utils';
import { saveLeagueUser } from '../../../../test/utils/league.utils';
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
import { CreateLeagueRoomDto } from '../dto/create-league-room.dto';
import * as faker from 'faker';
import { LeagueRoom } from '../league-room.entity';
import { LeagueRoomApplication } from '../applications/league-room-application.entity';
import { LEAGUE_ROOM_APPLICATION_STATUS } from '../applications/league-room-applications.config';

describe('Create league rooms integration tests', () => {
  let app: INestApplication;

  const getRoute = () => `/api/v1/league/rooms`;

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

  const invalidEntries = [
    {
      description: faker.datatype.number(),
      region: randomEnum(RIOT_API_REGIONS),
      demandedPositions: [RIOT_API_POSITIONS.ADC],
      date: faker.date.future(),
      ownerPosition: RIOT_API_POSITIONS.JUNGLE,
    },
    {
      region: faker.datatype.string(),
      demandedPositions: [RIOT_API_POSITIONS.SUPPORT],
      date: faker.date.future(),
      ownerPosition: RIOT_API_POSITIONS.TOP,
    },
    {
      region: randomEnum(RIOT_API_REGIONS),
      demandedPositions: [faker.datatype.string()],
      date: faker.date.future(),
      ownerPosition: randomEnum(RIOT_API_POSITIONS),
    },
    {
      region: randomEnum(RIOT_API_REGIONS),
      demandedPositions: [RIOT_API_POSITIONS.JUNGLE],
      date: faker.datatype.string(),
      ownerPosition: RIOT_API_POSITIONS.SUPPORT,
    },
    {
      region: randomEnum(RIOT_API_REGIONS),
      demandedPositions: [RIOT_API_POSITIONS.JUNGLE],
      date: faker.date.past(),
      ownerPosition: RIOT_API_POSITIONS.ADC,
    },
    {
      region: randomEnum(RIOT_API_REGIONS),
      demandedPositions: [],
      date: faker.date.future(),
      ownerPosition: randomEnum(RIOT_API_POSITIONS),
    },
    {
      region: randomEnum(RIOT_API_REGIONS),
      demandedPositions: [randomEnum(RIOT_API_POSITIONS)],
      date: faker.date.future(),
      ownerPosition: faker.datatype.string(),
    },
    {
      region: randomEnum(RIOT_API_REGIONS),
      demandedPositions: [RIOT_API_POSITIONS.ADC],
      date: faker.date.future(),
      ownerPosition: RIOT_API_POSITIONS.ADC,
    },
  ];

  it.each(invalidEntries)('422', async (invalidEntry) => {
    const res = await makeRequest(app)
      .post(getRoute())
      .set(
        authHeaderJwt({
          id: user.id,
        }),
      )
      .send(invalidEntry);

    expect(res.status).toBe(HttpStatus.UNPROCESSABLE_ENTITY);
  });
  it('404 - user games not existing', async () => {
    user = await saveUser();

    const given = {
      description: faker.datatype.string(),
      region: randomEnum(RIOT_API_REGIONS),
      demandedPositions: [randomEnum(RIOT_API_POSITIONS)],
      date: faker.date.future(),
      ownerPosition: randomEnum(RIOT_API_POSITIONS),
    } as CreateLeagueRoomDto;

    const res = await makeRequest(app)
      .post(getRoute())
      .set(
        authHeaderJwt({
          id: user.id,
        }),
      )
      .send(given);

    expect(res.status).toBe(HttpStatus.NOT_FOUND);
  });

  it('404 - user league not existing', async () => {
    user = await saveUser();
    userGames = await saveUserGames({ user });

    const given = {
      description: faker.datatype.string(),
      region: randomEnum(RIOT_API_REGIONS),
      demandedPositions: [randomEnum(RIOT_API_POSITIONS)],
      date: faker.date.future(),
      ownerPosition: randomEnum(RIOT_API_POSITIONS),
    } as CreateLeagueRoomDto;

    const res = await makeRequest(app)
      .post(getRoute())
      .set(
        authHeaderJwt({
          id: user.id,
        }),
      )
      .send(given);

    expect(res.status).toBe(HttpStatus.NOT_FOUND);
  });

  it('401', async () => {
    const res = await makeRequest(app).post(getRoute()).set({
      Authorization: 'Fake',
    });

    expect(res.status).toBe(HttpStatus.UNAUTHORIZED);
  });

  it('201', async () => {
    const given = {
      region: randomEnum(RIOT_API_REGIONS),
      demandedPositions: [RIOT_API_POSITIONS.JUNGLE],
      date: faker.date.future(),
      ownerPosition: RIOT_API_POSITIONS.MIDDLE,
    } as CreateLeagueRoomDto;

    const res = await makeRequest(app)
      .post(getRoute())
      .set(
        authHeaderJwt({
          id: user.id,
        }),
      )
      .send(given);

    const savedLeagueRoom = await getRepository(LeagueRoom).findOne();
    const savedApplication = await getRepository(LeagueRoomApplication).findOne(
      {
        relations: ['leagueUser', 'room'],
      },
    );

    expect(res.status).toBe(HttpStatus.CREATED);
    expect(savedLeagueRoom).toMatchObject({
      region: given.region,
      demandedPositions: given.demandedPositions,
      date: given.date,
      description: null,
    });
    expect(savedApplication).toMatchObject({
      leagueUser: expect.objectContaining({
        id: leagueUser.id,
      }),
      isOwner: true,
      status: LEAGUE_ROOM_APPLICATION_STATUS.APPROVED,
      appliedForPosition: given.ownerPosition,
      room: expect.objectContaining({
        id: savedLeagueRoom.id,
      }),
    });
  });

  it('201 - with description', async () => {
    const given = {
      description: faker.datatype.string(),
      region: randomEnum(RIOT_API_REGIONS),
      demandedPositions: [RIOT_API_POSITIONS.SUPPORT],
      date: faker.date.future(),
      ownerPosition: RIOT_API_POSITIONS.MIDDLE,
    } as CreateLeagueRoomDto;

    const res = await makeRequest(app)
      .post(getRoute())
      .set(
        authHeaderJwt({
          id: user.id,
        }),
      )
      .send(given);

    const savedLeagueRoom = await getRepository(LeagueRoom).findOne();

    expect(res.status).toBe(HttpStatus.CREATED);
    expect(savedLeagueRoom).toMatchObject({
      region: given.region,
      demandedPositions: given.demandedPositions,
      date: given.date,
      description: given.description,
    });
  });

  it('201 - username should be returned', async () => {
    const given = {
      description: faker.datatype.string(),
      region: randomEnum(RIOT_API_REGIONS),
      demandedPositions: [RIOT_API_POSITIONS.SUPPORT],
      date: faker.date.future(),
      ownerPosition: RIOT_API_POSITIONS.MIDDLE,
    } as CreateLeagueRoomDto;

    const res = await makeRequest(app)
      .post(getRoute())
      .set(
        authHeaderJwt({
          id: user.id,
        }),
      )
      .send(given);

    expect(res.status).toBe(HttpStatus.CREATED);
    expect(res.body.data).toMatchObject({
      owner: {
        username: user.username,
      },
    });
  });
});
