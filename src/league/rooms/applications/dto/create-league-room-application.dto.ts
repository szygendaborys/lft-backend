import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { RIOT_API_POSITIONS } from '../../../riotApi/riotApi.config';

export class CreateLeagueRoomApplicationDto {
  @ApiProperty({ enum: RIOT_API_POSITIONS })
  @IsEnum(RIOT_API_POSITIONS)
  demandedPosition: RIOT_API_POSITIONS;
}
