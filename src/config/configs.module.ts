import { Module } from '@nestjs/common';
import { ConfigsService } from './config.service';
import { ConfigsController } from './config.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GameConfigRepository } from './repositories/games.config.repository';
import { GameConfigSerializer } from './serializers/games.config.serializer';

@Module({
  imports: [TypeOrmModule.forFeature([GameConfigRepository])],
  controllers: [ConfigsController],
  providers: [ConfigsService, GameConfigSerializer],
})
export class ConfigsModule {}
