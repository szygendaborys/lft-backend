import { EntityManager } from 'typeorm';
import { GameConfig } from '../../../config/entities/game.config.entity';
import { SeedingEntity } from '../entities/seeding.entity';
import { initialGamesConfig } from '../fixtures/config.fixture';
import { Seeds } from '../seeding.config';

export default async function configSeed(
  transactionalEntityManager: EntityManager,
) {
  await this.wipeData([GameConfig]);

  const games = initialGamesConfig.map((gameConfig) =>
    this.gameConfigRepository.create(gameConfig),
  );

  await transactionalEntityManager.save(games);
  await transactionalEntityManager.save(new SeedingEntity(Seeds.CONFIG_SEED));
}
