import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  ArrayMinSize,
  IsDate,
  IsEnum,
  IsOptional,
  IsString,
  Length,
  MinDate,
} from 'class-validator';
import {
  RIOT_API_POSITIONS,
  RIOT_API_REGIONS,
} from '../../riotApi/riotApi.config';

export class CreateLeagueRoomDto {
  @ApiProperty({ enum: RIOT_API_REGIONS })
  @IsEnum(RIOT_API_REGIONS)
  region: RIOT_API_REGIONS;

  @ApiProperty({ enum: RIOT_API_POSITIONS, isArray: true })
  @IsEnum(RIOT_API_POSITIONS, { each: true })
  @ArrayMinSize(1)
  @Transform(({ value }) => [...new Set(value)])
  demandedPositions: RIOT_API_POSITIONS[];

  @ApiProperty()
  @IsDate()
  @Transform(({ value }) => new Date(value))
  @MinDate(new Date())
  date: Date;

  @ApiProperty({ enum: RIOT_API_POSITIONS })
  @IsEnum(RIOT_API_POSITIONS)
  ownerPosition: RIOT_API_POSITIONS;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(0, 1500)
  description?: string;
}
