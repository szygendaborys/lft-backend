import { ApiPropertyOptional } from '@nestjs/swagger';

export class LeagueRoomOwnerDto {
  @ApiPropertyOptional()
  username?: string;
}
