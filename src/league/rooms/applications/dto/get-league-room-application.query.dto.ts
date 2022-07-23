import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { ToInt } from '../../../../shared/transformers/toInt.transformer';
import { LEAGUE_ROOM_APPLICATION_STATUS } from '../league-room-applications.config';

export class GetLeagueRoomApplicationQueryDto {
  @ApiProperty({ enum: LEAGUE_ROOM_APPLICATION_STATUS })
  @IsEnum(LEAGUE_ROOM_APPLICATION_STATUS)
  @ToInt()
  status: LEAGUE_ROOM_APPLICATION_STATUS;
}
