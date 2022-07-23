import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { LEAGUE_ROOM_APPLICATION_STATUS } from '../league-room-applications.config';

export class UpdateLeagueRoomApplicationDto {
  @ApiProperty({ enum: LEAGUE_ROOM_APPLICATION_STATUS })
  @IsEnum(LEAGUE_ROOM_APPLICATION_STATUS)
  toStatus: LEAGUE_ROOM_APPLICATION_STATUS;
}
