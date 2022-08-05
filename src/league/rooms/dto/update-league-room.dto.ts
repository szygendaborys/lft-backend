import {
  ApiProperty,
  ApiPropertyOptional,
  PartialType,
  PickType,
} from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsEnum,
  IsOptional,
  IsUUID,
} from 'class-validator';
import { RIOT_API_POSITIONS } from '../../riotApi/riotApi.config';
import { CreateLeagueRoomDto } from './create-league-room.dto';

export class UpdateLeagueRoomDto extends PartialType(
  PickType(CreateLeagueRoomDto, ['date', 'description']),
) {
  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  ownerId?: string;

  @ApiPropertyOptional({ enum: RIOT_API_POSITIONS, isArray: true })
  @IsEnum(RIOT_API_POSITIONS, { each: true })
  @ArrayMinSize(0)
  @ArrayMaxSize(4)
  @Transform(({ value }) => [...new Set(value)])
  @IsOptional()
  demandedPositions: RIOT_API_POSITIONS[];
}
