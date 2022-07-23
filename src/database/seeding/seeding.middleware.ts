import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { NextFunction } from 'express';
import { snakeCase } from 'lodash';
import { EntityManager, getRepository } from 'typeorm';
import { GameConfigRepository } from '../../config/repositories/games.config.repository';
import { UserRepository } from '../../users/user.repository';
import { SeedingEntity } from './entities/seeding.entity';
import { Seeds } from './seeding.config';
import configSeed from './seeds/config.seed';
import usersSeed from './seeds/users.seed';
import leagueUserSeed from './seeds/league-user.seed';
import leagueRoomSeed from './seeds/league-room.seed';

@Injectable()
export class SeedingMiddleware implements NestMiddleware {
  private isSeedingComplete: Promise<boolean>;
  private readonly logger = new Logger(SeedingMiddleware.name);

  constructor(
    private readonly entityManager: EntityManager,
    // repositories must be defined here - we use them in the scope of 'call' method
    private readonly usersRepository: UserRepository,
    private readonly gameConfigRepository: GameConfigRepository,
  ) {}

  async use(req: Request, res: Response, next: NextFunction) {
    if (await this.isSeedingComplete) {
      return next();
    }

    this.isSeedingComplete = (async () => {
      this.logger.debug('Starting seeding...');

      if (process.env.NODE_ENV === 'production') return true;

      // (if wiping all data/reseeding is required);
      // currently does not work, if needed we can change its name
      // await this.wipeData([SeedingEntity]);

      // USERS_SEED
      if (
        !(await this.entityManager.findOne(SeedingEntity, {
          id: Seeds.USERS_SEED,
        }))
      ) {
        await this.entityManager.transaction(
          async (transactionalEntityManager) => {
            await usersSeed.call(this, transactionalEntityManager);
          },
        );
      }

      // CONFIG_SEED
      if (
        !(await this.entityManager.findOne(SeedingEntity, {
          id: Seeds.CONFIG_SEED,
        }))
      ) {
        await this.entityManager.transaction(
          async (transactionalEntityManager) => {
            await configSeed.call(this, transactionalEntityManager);
          },
        );
      }

      // LEAGUE_USER_SEED
      if (
        !(await this.entityManager.findOne(SeedingEntity, {
          id: Seeds.LEAGUE_USER_SEED,
        }))
      ) {
        await this.entityManager.transaction(
          async (transactionalEntityManager) => {
            await leagueUserSeed.call(this, transactionalEntityManager);
          },
        );
      }

      // LEAGUE_ROOM_SEED
      if (
        !(await this.entityManager.findOne(SeedingEntity, {
          id: Seeds.LEAGUE_ROOM_SEED,
        }))
      ) {
        await this.entityManager.transaction(
          async (transactionalEntityManager) => {
            await leagueRoomSeed.call(this, transactionalEntityManager);
          },
        );
      }

      // ... you can add another seeding part here below starting from if() ...

      this.logger.debug('Seeding completed');

      return true;
    })();

    await this.isSeedingComplete;

    next();
  }

  async wipeData(entities: any[]) {
    try {
      for (const entity of entities) {
        const name = snakeCase(entity.name).toLowerCase();
        this.logger.log(`Clearing ${name}`);
        const repository = getRepository(name);
        await repository.createQueryBuilder().delete().execute();
        // await repository.query(`DELETE FROM ${name};`);
      }
    } catch (error) {
      throw new Error(`ERROR: Cleaning test db: ${error}`);
    }
  }

  private getRandomInt(max: number) {
    return Math.floor(Math.random() * Math.floor(max));
  }
}
