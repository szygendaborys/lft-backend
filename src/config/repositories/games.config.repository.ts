import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GameConfig } from '../entities/game.config.entity';

@Injectable()
export class GameConfigRepository {
  constructor(
    @InjectRepository(GameConfig)
    private readonly repository: Repository<GameConfig>,
  ) {}

  async getActiveGames(): Promise<GameConfig[]> {
    return this.repository.find({ where: { isActive: true } });
  }
}
