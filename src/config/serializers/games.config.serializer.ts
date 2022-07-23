import { plainToClass } from 'class-transformer';
import { AbstractSerializer } from '../../shared/serializer/abstract.serializer';
import { GameConfigDto } from '../dto/game.config.dto';
import { GameConfig } from '../entities/game.config.entity';

export class GameConfigSerializer extends AbstractSerializer<
  GameConfig,
  GameConfigDto
> {
  serialize(entity: GameConfig): GameConfigDto {
    return plainToClass(GameConfigDto, entity, {
      excludeExtraneousValues: true,
    });
  }
}
