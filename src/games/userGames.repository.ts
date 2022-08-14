import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserGames } from './userGames.entity';

@Injectable()
export class UserGamesRepository {
  constructor(
    @InjectRepository(UserGames)
    private readonly repository: Repository<UserGames>,
  ) {}

  create(payload: Partial<UserGames>): UserGames {
    return this.repository.create(payload);
  }

  findByUserIdWithRelations(userId: string): Promise<UserGames | undefined> {
    return this.repository
      .createQueryBuilder('ug')
      .innerJoinAndSelect('ug.user', 'u', 'u.id = :userId', { userId })
      .leftJoinAndSelect('ug.league_of_legends', 'l')
      .getOne();
  }
}
