import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { TicketType } from './ticket.types';

export class CreateTicketDto {
  @ApiProperty()
  @IsString()
  @MaxLength(1500)
  @IsNotEmpty()
  message: string;

  @ApiProperty()
  @IsEnum(TicketType)
  @IsNotEmpty()
  type: TicketType;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  authorName?: string;

  @ApiPropertyOptional()
  @IsEmail()
  @IsOptional()
  authorEmail?: string;
}
