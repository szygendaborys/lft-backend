import { Injectable } from '@nestjs/common';
import { AbstractSerializer } from '../../shared/serializer/abstract.serializer';
import { LeagueRoomDto } from './dto/league-room.dto';
import { LeagueRoom } from './league-room.entity';

@Injectable()
export class LeagueRoomsSerializer extends AbstractSerializer<
  LeagueRoom,
  LeagueRoomDto
> {
  serialize(leagueRoom: LeagueRoom): LeagueRoomDto {
    const owner = leagueRoom.getOwner();

    return {
      id: leagueRoom.id,
      date: new Date(leagueRoom.date),
      demandedPositions: leagueRoom.demandedPositions,
      region: leagueRoom.region,
      currentPlayers: leagueRoom.currentPlayers,
      requiredPlayers: leagueRoom.requiredPlayers,
      owner: {
        username: owner?.username,
      },
    };
  }
}
