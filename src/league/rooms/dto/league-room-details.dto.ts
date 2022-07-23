import { ApiProperty } from '@nestjs/swagger';
import {
  RIOT_API_POSITIONS,
  RIOT_API_REGIONS,
} from '../../riotApi/riotApi.config';
import { LeagueRoomApplicationDto } from '../applications/dto/league-room-application.dto';

export class LeagueRoomDetailsDto {
  @ApiProperty({ format: 'uuid' })
  id: string;

  @ApiProperty()
  date: Date;

  @ApiProperty()
  description: string;

  @ApiProperty({ enum: RIOT_API_POSITIONS, isArray: true })
  demandedPositions: RIOT_API_POSITIONS[];

  @ApiProperty()
  currentPlayers: number;

  @ApiProperty()
  requiredPlayers: number;

  @ApiProperty({ enum: RIOT_API_REGIONS })
  region: RIOT_API_REGIONS;

  @ApiProperty({ type: LeagueRoomApplicationDto, isArray: true })
  applications: LeagueRoomApplicationDto[];
}
