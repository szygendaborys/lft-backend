import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { RIOT_API_REGIONS } from '../riotApi.config';

export class RiotApiSummonerFindByNameParams {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  summonerName: string;

  @ApiProperty()
  @IsEnum(RIOT_API_REGIONS)
  @IsNotEmpty()
  region: RIOT_API_REGIONS;
}

export class RiotApiRankedDataBySummonerIdParams {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  summonerId: string;

  @ApiProperty()
  @IsEnum(RIOT_API_REGIONS)
  @IsNotEmpty()
  region: RIOT_API_REGIONS;
}
