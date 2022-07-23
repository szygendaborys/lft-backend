import { EntityManager } from 'typeorm';
import { LeagueUser } from '../../../league/users/league-user.entity';
import { User } from '../../../users/user.entity';
import { SeedingEntity } from '../entities/seeding.entity';
import { initialLeagueUsers } from '../fixtures/league-user.fixture';
import { Seeds } from '../seeding.config';

export default async function usersSeed(
  transactionalEntityManager: EntityManager,
) {
  await this.wipeData([LeagueUser]);

  const savedUsers = await transactionalEntityManager
    .getRepository(User)
    .find({ relations: ['games'] });

  await transactionalEntityManager.getRepository(User).save(
    savedUsers.map((savedUser, i) => ({
      ...savedUser,
      games: {
        ...savedUser.games,
        league_of_legends: initialLeagueUsers[i],
      },
    })),
  );

  await transactionalEntityManager.save(
    new SeedingEntity(Seeds.LEAGUE_USER_SEED),
  );
}
