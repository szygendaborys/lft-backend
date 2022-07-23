import { IsEnum, IsString } from 'class-validator';
import {
  RIOT_API_POSITIONS,
  RIOT_API_REGIONS,
} from '../../riotApi/riotApi.config';

export class CreateLeagueUserDto {
  @IsString()
  summonerName: string;

  @IsEnum(RIOT_API_REGIONS)
  region: RIOT_API_REGIONS;

  @IsEnum(RIOT_API_POSITIONS)
  mainPosition: RIOT_API_POSITIONS;

  @IsEnum(RIOT_API_POSITIONS)
  secondaryPosition: RIOT_API_POSITIONS;
}
