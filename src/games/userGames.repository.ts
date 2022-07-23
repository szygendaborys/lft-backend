import { EntityRepository, Repository } from 'typeorm';
import { UserGames } from './userGames.entity';

@EntityRepository(UserGames)
export class UserGamesRepository extends Repository<UserGames> {
  findByUserIdWithRelations(userId: string): Promise<UserGames | undefined> {
    return this.createQueryBuilder('ug')
      .innerJoinAndSelect('ug.user', 'u', 'u.id = :userId', { userId })
      .leftJoinAndSelect('ug.league_of_legends', 'l')
      .getOne();
  }
}
