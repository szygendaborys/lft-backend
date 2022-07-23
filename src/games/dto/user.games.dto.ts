import { ApiProperty } from '@nestjs/swagger';
import { Games } from '../games';

export class UserGamesDto {
  @ApiProperty({ enum: Games })
  game: Games;

  @ApiProperty()
  data: Record<string, any>;
}
