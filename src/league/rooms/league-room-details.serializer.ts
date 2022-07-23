import { Injectable } from '@nestjs/common';
import { AbstractSerializer } from '../../shared/serializer/abstract.serializer';
import { LeagueRoomApplicationsSerializer } from './applications/league-room-applications.serializer';
import { LeagueRoomDetailsDto } from './dto/league-room-details.dto';
import { LeagueRoom } from './league-room.entity';

@Injectable()
export class LeagueRoomDetailsSerializer extends AbstractSerializer<
  LeagueRoom & Partial<LeagueRoomDetailsDto>,
  LeagueRoomDetailsDto
> {
  constructor(
    private readonly leagueRoomApplicationSerializer: LeagueRoomApplicationsSerializer,
  ) {
    super();
  }

  serialize(leagueRoom: LeagueRoom): LeagueRoomDetailsDto {
    return {
      id: leagueRoom.id,
      date: new Date(leagueRoom.date),
      description: leagueRoom.description ?? '',
      demandedPositions: leagueRoom.demandedPositions,
      region: leagueRoom.region,
      currentPlayers: leagueRoom.currentPlayers,
      requiredPlayers: leagueRoom.requiredPlayers,
      applications: this.leagueRoomApplicationSerializer.serializeCollection(
        leagueRoom.applications,
      ),
    };
  }
}
