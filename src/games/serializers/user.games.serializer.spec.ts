import { createUserGames } from '../../../test/utils/games.utils';
import { createLeagueUser } from '../../../test/utils/league.utils';
import { UserGamesSerializer } from './user.games.serializer';

describe('User games unit test', () => {
  const serializer = new UserGamesSerializer();

  it('Should serialize empty games', () => {
    const entry = createUserGames();

    const result = serializer.serialize(entry);
    expect(result).toMatchObject([]);
  });

  it('Should serialize league of legends', () => {
    const leagueUser = createLeagueUser();
    const entry = createUserGames({
      league_of_legends: leagueUser,
    });

    const result = serializer.serialize(entry);

    expect(result).toMatchObject([
      {
        game: 'league_of_legends',
        data: {
          id: leagueUser.id,
          summonerId: leagueUser.summonerId,
          region: leagueUser.region,
        },
      },
    ]);
  });
});
