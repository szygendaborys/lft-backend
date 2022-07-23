import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { RIOT_API_POSITIONS } from '../../../riotApi/riotApi.config';
import { LeagueUserDto } from '../../../users/dto/league-user.dto';
import { LEAGUE_ROOM_APPLICATION_STATUS } from '../league-room-applications.config';

export class LeagueRoomApplicationDto {
  @ApiProperty()
  id: string;

  @ApiProperty({ enum: LEAGUE_ROOM_APPLICATION_STATUS })
  status: LEAGUE_ROOM_APPLICATION_STATUS;

  @ApiProperty({ enum: RIOT_API_POSITIONS })
  appliedForPosition: RIOT_API_POSITIONS;

  @ApiProperty()
  isOwner: boolean;

  @ApiProperty({ type: LeagueUserDto })
  @Type(() => LeagueUserDto)
  leagueUser: LeagueUserDto;
}
