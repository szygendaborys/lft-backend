import * as faker from 'faker';
import { v4 } from 'uuid';
import {
  RIOT_API_POSITIONS,
  RIOT_API_REGIONS,
} from '../../src/league/riotApi/riotApi.config';
import { LeagueRoomApplication } from '../../src/league/rooms/applications/league-room-application.entity';
import { LEAGUE_ROOM_APPLICATION_STATUS } from '../../src/league/rooms/applications/league-room-applications.config';
import { LeagueRoom } from '../../src/league/rooms/league-room.entity';
import { LeagueUser } from '../../src/league/users/league-user.entity';
import { testDataSource } from '../test.module';
import { createUserGames } from './games.utils';
import { randomEnum } from './test.utils';

export function createLeagueUser(opts?: Partial<LeagueUser>): LeagueUser {
  return new LeagueUser({
    userGames: createUserGames(),
    summonerId: faker.datatype.string(),
    region: randomEnum(RIOT_API_REGIONS),
    mainPosition: randomEnum(RIOT_API_POSITIONS),
    secondaryPosition: randomEnum(RIOT_API_POSITIONS),
    ...opts,
  });
}

export async function saveLeagueUser(
  opts?: Partial<LeagueUser>,
): Promise<LeagueUser> {
  return testDataSource.getRepository(LeagueUser).save(createLeagueUser(opts));
}

export function createLeagueRoomApplication(
  opts?: Partial<LeagueRoomApplication>,
): LeagueRoomApplication {
  return new LeagueRoomApplication({
    id: v4(),
    status: faker.random.arrayElement([
      LEAGUE_ROOM_APPLICATION_STATUS.APPROVED,
      LEAGUE_ROOM_APPLICATION_STATUS.LEFT,
      LEAGUE_ROOM_APPLICATION_STATUS.PENDING,
      LEAGUE_ROOM_APPLICATION_STATUS.REJECTED,
    ]),
    appliedForPosition: randomEnum(RIOT_API_POSITIONS),
    isOwner: false,
    leagueUser: createLeagueUser(),
    ...opts,
  });
}

export async function saveLeagueRoomApplication(
  opts?: Partial<LeagueRoomApplication>,
): Promise<LeagueRoomApplication> {
  const leagueUser = opts?.leagueUser
    ? opts.leagueUser
    : await saveLeagueUser();

  const room = opts?.room ?? (await saveLeagueRoom());

  return testDataSource.getRepository(LeagueRoomApplication).save(
    createLeagueRoomApplication({
      leagueUser,
      room,
      ...opts,
    }),
  );
}

export function createLeagueRoom(opts?: Partial<LeagueRoom>): LeagueRoom {
  return new LeagueRoom({
    id: v4(),
    description: faker.datatype.string(),
    region: randomEnum(RIOT_API_REGIONS),
    date: faker.date.future(),
    demandedPositions: [randomEnum(RIOT_API_POSITIONS)],
    applications: [],
    ...opts,
  });
}

export async function saveLeagueRoom(
  opts?: Partial<LeagueRoom> & {
    owner?: LeagueUser;
  },
): Promise<LeagueRoom> {
  const room = await testDataSource.getRepository(LeagueRoom).save(
    createLeagueRoom({
      ...opts,
    }),
  );

  if (opts?.owner) {
    await saveLeagueRoomApplication({
      leagueUser: opts.owner,
      room,
      isOwner: true,
      status: LEAGUE_ROOM_APPLICATION_STATUS.APPROVED,
    });
  }

  return room;
}

export function getRandomApplicationStatus(): LEAGUE_ROOM_APPLICATION_STATUS {
  return faker.random.arrayElement([
    LEAGUE_ROOM_APPLICATION_STATUS.APPROVED,
    LEAGUE_ROOM_APPLICATION_STATUS.REJECTED,
    LEAGUE_ROOM_APPLICATION_STATUS.LEFT,
    LEAGUE_ROOM_APPLICATION_STATUS.PENDING,
  ]);
}
