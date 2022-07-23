import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { Games } from '../../games/games';

export class GameConfigDto {
  @ApiProperty({ format: 'uuid' })
  @Expose()
  id: string;

  @ApiProperty({ enum: Games })
  @Expose()
  key: Games;

  @ApiProperty()
  @Expose()
  name: string;

  @ApiProperty()
  @Expose()
  logo: string;

  @ApiPropertyOptional()
  @Expose()
  description: string | null;

  @ApiProperty()
  @Expose()
  isActive: boolean;

  @ApiProperty()
  @Expose()
  href: string;
}
