import { EntityRepository, Repository } from 'typeorm';
import { User } from './user.entity';

@EntityRepository(User)
export class UserRepository extends Repository<User> {
  async findOneById(id: string): Promise<User | undefined> {
    return this.findOne(id);
  }

  async findOneByIdWithGames(id: string): Promise<User | undefined> {
    return this.findOne(id, {
      relations: ['games'],
    });
  }

  async findOneByUsername(username: string): Promise<User | undefined> {
    return this.findOne({ username });
  }

  async findOneByUsernameWithGames(
    username: string,
  ): Promise<User | undefined> {
    return this.findOne({
      where: {
        username,
      },
      relations: ['games'],
    });
  }
}
