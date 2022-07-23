import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsArray, IsDate, IsEnum, IsOptional } from 'class-validator';
import { PageOptionsDto } from '../../../shared/page/pageOptions.dto';
import { ToArray } from '../../../shared/transformers/toArray.transformer';
import { RIOT_API_POSITIONS } from '../../riotApi/riotApi.config';

export class SearchLeagueRoomQueryDto extends PageOptionsDto {
  @ApiPropertyOptional()
  @IsDate()
  @IsOptional()
  @Transform(({ value }) => new Date(value))
  dateFrom: Date;

  @ApiPropertyOptional()
  @IsDate()
  @IsOptional()
  @Transform(({ value }) => new Date(value))
  dateTo: Date;

  @ApiPropertyOptional({
    enum: RIOT_API_POSITIONS,
    isArray: true,
  })
  @IsEnum(RIOT_API_POSITIONS, { each: true })
  @IsArray()
  @ToArray()
  @IsOptional()
  demandedPositions: RIOT_API_POSITIONS[];
}
