import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LeagueUser } from './league-user.entity';

@Injectable()
export class LeagueUserRepository {
  constructor(
    @InjectRepository(LeagueUser)
    private readonly repository: Repository<LeagueUser>,
  ) {}

  async saveOne(leagueUser: LeagueUser): Promise<LeagueUser> {
    return this.repository.save(leagueUser);
  }

  async findByUserId(userId: string): Promise<LeagueUser | undefined> {
    return this.repository
      .createQueryBuilder('lu')
      .innerJoinAndSelect('lu.userGames', 'ug')
      .innerJoinAndSelect('ug.user', 'u', 'u.id = :userId', { userId })
      .getOne();
  }

  async removeLeagueUser(leagueUser: LeagueUser): Promise<void> {
    await this.repository.remove(leagueUser);
  }
}
