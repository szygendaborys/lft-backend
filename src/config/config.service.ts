import { Injectable } from '@nestjs/common';
import { GameConfig } from './entities/game.config.entity';
import { GameConfigRepository } from './repositories/games.config.repository';

@Injectable()
export class ConfigsService {
  constructor(private readonly gamesConfigRepository: GameConfigRepository) {}

  async getGamesConfig(): Promise<GameConfig[]> {
    return await this.gamesConfigRepository.getActiveGames();
  }
}
