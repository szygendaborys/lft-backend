import { ApiProperty } from '@nestjs/swagger';
import { UserDto } from '../../users/dto/user.dto';
import { TokenPayloadDto } from './tokenPayload.dto';

export class LoginPayloadDto {
  @ApiProperty({
    type: UserDto,
  })
  user: UserDto;

  @ApiProperty({
    type: TokenPayloadDto,
  })
  refreshToken: TokenPayloadDto;

  @ApiProperty({
    type: TokenPayloadDto,
  })
  accessToken: TokenPayloadDto;
}
