import { EntityRepository, Repository } from 'typeorm';
import { LeagueUser } from './league-user.entity';

@EntityRepository(LeagueUser)
export class LeagueUserRepository extends Repository<LeagueUser> {
  async saveOne(leagueUser: LeagueUser): Promise<LeagueUser> {
    return this.save(leagueUser);
  }

  async findByUserId(userId: string): Promise<LeagueUser | undefined> {
    return this.createQueryBuilder('lu')
      .innerJoinAndSelect('lu.userGames', 'ug')
      .innerJoinAndSelect('ug.user', 'u', 'u.id = :userId', { userId })
      .getOne();
  }

  async removeLeagueUser(leagueUser: LeagueUser): Promise<void> {
    await this.remove(leagueUser);
  }
}
