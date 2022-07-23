import { createLeagueUser } from '../../../test/utils/league.utils';
import { LeagueUsersSerializer } from './league-user.serializer';
describe('League user serializer unit tests', () => {
  let serializer: LeagueUsersSerializer;

  beforeEach(() => {
    serializer = new LeagueUsersSerializer();
  });

  it('Should correctly serializer', () => {
    const leagueUser = createLeagueUser();
    const { user } = leagueUser.userGames;

    const result = serializer.serialize(leagueUser);

    expect(result).toMatchObject({
      id: leagueUser.id,
      summonerId: leagueUser.summonerId,
      region: leagueUser.region,
      mainPosition: leagueUser.mainPosition,
      secondaryPosition: leagueUser.secondaryPosition,
      username: user.username,
    });
  });
});
