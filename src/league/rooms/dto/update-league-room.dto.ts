import { ApiPropertyOptional, PartialType, PickType } from '@nestjs/swagger';
import { IsOptional, IsUUID } from 'class-validator';
import { CreateLeagueRoomDto } from './create-league-room.dto';

export class UpdateLeagueRoomDto extends PartialType(
  PickType(CreateLeagueRoomDto, ['date', 'demandedPositions', 'description']),
) {
  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  ownerId?: string;
}
