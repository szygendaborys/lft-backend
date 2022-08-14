import { GameConfig } from './../../config/entities/game.config.entity';
import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GameConfigRepository } from '../../config/repositories/games.config.repository';
import { User } from '../../users/user.entity';
import { UserRepository } from '../../users/user.repository';
import { SeedingMiddleware } from './seeding.middleware';

@Module({
  imports: [TypeOrmModule.forFeature([User, GameConfig])],
  providers: [UserRepository, GameConfigRepository],
})
export class SeedingModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(SeedingMiddleware).forRoutes('*');
  }
}
