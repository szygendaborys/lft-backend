import { Injectable } from '@nestjs/common';
import { UserGamesSerializer } from '../games/serializers/user.games.serializer';
import { AbstractSerializer } from '../shared/serializer/abstract.serializer';
import { UserDto } from './dto/user.dto';
import { User } from './user.entity';

@Injectable()
export class UsersSerializer extends AbstractSerializer<User, UserDto> {
  constructor(private readonly userGamesSerializer: UserGamesSerializer) {
    super();
  }

  serialize(user: User): UserDto {
    return {
      id: user.id,
      username: user.username,
      ...(user.games && {
        games: this.userGamesSerializer.serialize(user.games),
      }),
    };
  }
}
