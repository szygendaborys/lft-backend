import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import {
  RIOT_API_POSITIONS,
  RIOT_API_REGIONS,
} from '../../riotApi/riotApi.config';

export class LeagueUserDto {
  @ApiProperty({ type: 'uuid' })
  @Expose()
  id: string;

  @ApiProperty()
  @Expose()
  summonerId: string;

  @ApiProperty({ enum: RIOT_API_REGIONS })
  @Expose()
  region: RIOT_API_REGIONS;

  @ApiProperty({ enum: RIOT_API_POSITIONS })
  @Expose()
  mainPosition: RIOT_API_POSITIONS;

  @ApiProperty({ enum: RIOT_API_POSITIONS })
  @Expose()
  secondaryPosition: RIOT_API_POSITIONS;

  @ApiPropertyOptional()
  username: string;
}
