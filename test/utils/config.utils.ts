import * as faker from 'faker';
import { GameConfig } from '../../src/config/entities/game.config.entity';
import { Games } from '../../src/games/games';
import { testDataSource } from '../test.module';
import { randomEnum } from './test.utils';

export async function saveGameConfig(opts?: {
  isActive?: boolean;
}): Promise<GameConfig> {
  return testDataSource.getRepository(GameConfig).save(createGameConfig(opts));
}

export function createGameConfig(opts?: { isActive?: boolean }) {
  return {
    id: faker.datatype.uuid(),
    key: randomEnum(Games),
    name: faker.random.word(),
    description: faker.random.words(),
    isActive: opts?.isActive ?? faker.datatype.boolean(),
    logo: faker.internet.url(),
    href: faker.internet.url(),
  } as GameConfig;
}
