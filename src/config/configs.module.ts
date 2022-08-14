import { Module } from '@nestjs/common';
import { ConfigsService } from './config.service';
import { ConfigsController } from './config.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GameConfigRepository } from './repositories/games.config.repository';
import { GameConfigSerializer } from './serializers/games.config.serializer';
import { GameConfig } from './entities/game.config.entity';

@Module({
  imports: [TypeOrmModule.forFeature([GameConfig])],
  controllers: [ConfigsController],
  providers: [ConfigsService, GameConfigSerializer, GameConfigRepository],
})
export class ConfigsModule {}
