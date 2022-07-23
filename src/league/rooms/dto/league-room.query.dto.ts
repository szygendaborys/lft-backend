import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { PageOptionsDto } from '../../../shared/page/pageOptions.dto';
import { ToInt } from '../../../shared/transformers/toInt.transformer';
import { LEAGUE_ROOM_APPLICATION_STATUS } from '../applications/league-room-applications.config';

export class LeagueRoomQueryDto extends PageOptionsDto {
  @ApiProperty({
    enum: LEAGUE_ROOM_APPLICATION_STATUS,
  })
  @IsEnum(LEAGUE_ROOM_APPLICATION_STATUS)
  @ToInt()
  status: LEAGUE_ROOM_APPLICATION_STATUS;
}
