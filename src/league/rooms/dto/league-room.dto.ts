import { LeagueRoomOwnerDto } from './league-room-owner.dto';
import { ApiProperty } from '@nestjs/swagger';
import {
  RIOT_API_POSITIONS,
  RIOT_API_REGIONS,
} from '../../riotApi/riotApi.config';

export class LeagueRoomDto {
  @ApiProperty({ format: 'uuid' })
  id: string;

  @ApiProperty()
  date: Date;

  @ApiProperty({ enum: RIOT_API_POSITIONS, isArray: true })
  demandedPositions: RIOT_API_POSITIONS[];

  @ApiProperty()
  currentPlayers: number;

  @ApiProperty()
  requiredPlayers: number;

  @ApiProperty({ enum: RIOT_API_REGIONS })
  region: RIOT_API_REGIONS;

  @ApiProperty({ type: LeagueRoomOwnerDto })
  owner: LeagueRoomOwnerDto;
}
