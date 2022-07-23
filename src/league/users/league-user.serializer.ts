import { LeagueUserDto } from './dto/league-user.dto';
import { LeagueUser } from './league-user.entity';
import { Injectable } from '@nestjs/common';
import { AbstractSerializer } from '../../shared/serializer/abstract.serializer';

@Injectable()
export class LeagueUsersSerializer extends AbstractSerializer<
  LeagueUser,
  LeagueUserDto
> {
  public serialize(entity: LeagueUser): LeagueUserDto {
    return {
      id: entity.id,
      summonerId: entity.summonerId,
      region: entity.region,
      mainPosition: entity.mainPosition,
      secondaryPosition: entity.secondaryPosition,
      ...(entity.userGames?.user?.username && {
        username: entity.userGames.user.username,
      }),
    };
  }
}
