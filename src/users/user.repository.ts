import { UserDto } from './dto/user.dto';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOneOptions, Repository } from 'typeorm';
import { User } from './user.entity';

@Injectable()
export class UserRepository {
  constructor(
    @InjectRepository(User)
    private readonly repository: Repository<User>,
  ) {}

  save(entity: Partial<User>): Promise<User> {
    return this.repository.save(entity);
  }

  findOne(options: FindOneOptions<User>): Promise<User | null> {
    return this.repository.findOne(options);
  }

  async findOneById(id: string): Promise<User | undefined> {
    return this.repository.findOne({
      where: { id },
    });
  }

  async findOneByIdWithGames(id: string): Promise<User | undefined> {
    return this.repository.findOne({
      where: { id },
      relations: ['games'],
    });
  }

  async findOneByUsername(username: string): Promise<User | undefined> {
    return this.repository.findOne({ where: { username } });
  }

  async findOneByUsernameWithGames(
    username: string,
  ): Promise<User | undefined> {
    return this.repository.findOne({
      where: {
        username,
      },
      relations: ['games'],
    });
  }
}
