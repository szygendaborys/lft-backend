import { LeagueUser } from './../../../league/users/league-user.entity';
import { createLeagueUser } from '../../../../test/utils/league.utils';
import { RIOT_API_REGIONS } from '../../../league/riotApi/riotApi.config';

const numberOfLeagueUsers = 10;
const RIOT_ACCOUNT_ID = '-xDYqhmVeEKqRk5PllzVWgLsZIVA-2p5TNh4PutmksTJeQ';

export const initialLeagueUsers: LeagueUser[] = [];

for (let i = 0; i < numberOfLeagueUsers; i++) {
  initialLeagueUsers.push(
    createLeagueUser({
      summonerId: RIOT_ACCOUNT_ID,
      region: RIOT_API_REGIONS.EUNE,
    }),
  );
}
