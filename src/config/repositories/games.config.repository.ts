import { EntityRepository, Repository } from 'typeorm';
import { GameConfig } from '../entities/game.config.entity';

@EntityRepository(GameConfig)
export class GameConfigRepository extends Repository<GameConfig> {
  async getActiveGames(): Promise<GameConfig[]> {
    return this.find({ isActive: true });
  }
}
