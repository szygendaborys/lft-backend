import { Injectable } from '@nestjs/common';
import { Serializable } from '../../shared/serializer/serializable';
import { AbstractSerializer } from '../../shared/serializer/abstract.serializer';
import { UserGamesDto } from '../dto/user.games.dto';
import { Games } from '../games';
import { UserGames } from '../userGames.entity';

@Injectable()
export class UserGamesSerializer extends AbstractSerializer<
  UserGames,
  UserGamesDto[]
> {
  serialize(entity: UserGames): UserGamesDto[] {
    const dto: Partial<UserGames> = { ...entity };

    return Object.entries(dto).reduce((acc, [game, entity]): UserGamesDto[] => {
      if (Object.values(Games).includes(game as Games)) {
        const serializableEntity = (entity as unknown) as Serializable<any>;
        acc.push({
          game,
          data: serializableEntity?.serialize() ?? serializableEntity,
        });
      }

      return acc;
    }, []);
  }
}
