import { ApiProperty } from '@nestjs/swagger';

export class TokenPayloadDto {
  @ApiProperty({
    description: 'Timestamp date of the expiration time',
  })
  expiresAt: number;

  @ApiProperty()
  token: string;

  constructor(partial: Partial<TokenPayloadDto>) {
    Object.assign(this, partial);
  }
}
