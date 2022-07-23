import { HttpStatus } from '@nestjs/common';
import * as faker from 'faker';
import {
  RIOT_API_QUEUE_TYPES,
  RIOT_API_RANKED_TIERS,
  RIOT_API_RANKS,
} from '../../src/league/riotApi/riotApi.config';
import { randomEnum } from './test.utils';

export function createRiotLeaguePlayerData(opts?: { id?: string }) {
  return {
    id: faker.datatype.string(20),
    accountId: faker.datatype.string(20),
    puuid: faker.datatype.string(30),
    name: faker.internet.userName(),
    profileIconId: faker.datatype.number(),
    revisionDate: faker.date.recent().getTime(),
    summonerLevel: faker.datatype.number(),
    ...opts,
  };
}

export function createRiotLeaguePlayerRankedData(opts: {
  queueType: RIOT_API_QUEUE_TYPES;
}) {
  return {
    leagueId: faker.datatype.uuid(),
    queueType: opts.queueType,
    tier: randomEnum(RIOT_API_RANKED_TIERS),
    rank: randomEnum(RIOT_API_RANKS),
    summonerId: faker.datatype.string(20),
    summonerName: faker.internet.userName(),
    leaguePoints: faker.datatype.number({ min: 0, max: 100 }),
    wins: faker.datatype.number(),
    losses: faker.datatype.number(),
    veteran: faker.datatype.boolean(),
    inactive: faker.datatype.boolean(),
    freshBlood: faker.datatype.boolean(),
    hotStreak: faker.datatype.boolean(),
  };
}

export function createRandomRiotApiException() {
  return {
    response: {
      data: {
        status: {
          message: faker.datatype.string(),
          status_code: HttpStatus.SERVICE_UNAVAILABLE,
        },
      },
    },
  };
}
