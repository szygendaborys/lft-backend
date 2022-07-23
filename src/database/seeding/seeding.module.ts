import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GameConfigRepository } from '../../config/repositories/games.config.repository';
import { UserRepository } from '../../users/user.repository';
import { SeedingMiddleware } from './seeding.middleware';

@Module({
  imports: [TypeOrmModule.forFeature([UserRepository, GameConfigRepository])],
})
export class SeedingModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(SeedingMiddleware).forRoutes('*');
  }
}
