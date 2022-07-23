import { createLeagueUser } from '../../../test/utils/league.utils';

describe('League user entity unit tests', () => {
  it('Should serialize', () => {
    const leagueUser = createLeagueUser();

    const result = leagueUser.serialize();

    expect(result).toMatchObject({
      id: leagueUser.id,
      summonerId: leagueUser.summonerId,
      region: leagueUser.region,
    });
  });
});
