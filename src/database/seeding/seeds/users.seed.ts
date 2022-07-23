import { EntityManager } from 'typeorm';
import { User } from '../../../users/user.entity';
import { SeedingEntity } from '../entities/seeding.entity';
import { initialUsers } from '../fixtures/users.fixture';
import { Seeds } from '../seeding.config';

export default async function usersSeed(
  transactionalEntityManager: EntityManager,
) {
  await this.wipeData([User]);

  const users = initialUsers.map((user) =>
    this.usersRepository.create({ ...user, games: { user } }),
  );
  await transactionalEntityManager.save(users);

  await transactionalEntityManager.save(new SeedingEntity(Seeds.USERS_SEED));
}
