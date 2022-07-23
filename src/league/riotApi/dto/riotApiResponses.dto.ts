import { ApiProperty } from '@nestjs/swagger';
import {
  RIOT_API_QUEUE_TYPES,
  RIOT_API_RANKED_TIERS,
  RIOT_API_RANKS,
} from '../riotApi.config';

export class RiotApiSummonerResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  accountId: string;

  @ApiProperty()
  puuid: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  profileIconId: number;

  @ApiProperty()
  revisionDate: number;

  @ApiProperty()
  summonerLevel: number;
}

export class RiotApiRankedDataBySummonerIdDto {
  @ApiProperty({ format: 'uuid' })
  leagueId: string;

  @ApiProperty({ enum: RIOT_API_QUEUE_TYPES })
  queueType: RIOT_API_QUEUE_TYPES;

  @ApiProperty({ enum: RIOT_API_RANKED_TIERS })
  tier: RIOT_API_RANKED_TIERS;

  @ApiProperty({ enum: RIOT_API_RANKS })
  rank: RIOT_API_RANKS;

  @ApiProperty()
  summonerName: string;

  @ApiProperty()
  leaguePoints: number;

  @ApiProperty()
  wins: number;

  @ApiProperty()
  losses: number;

  @ApiProperty()
  veteran: boolean;

  @ApiProperty()
  inactive: boolean;

  @ApiProperty()
  freshBloog: boolean;

  @ApiProperty()
  hotStreak: boolean;
}
