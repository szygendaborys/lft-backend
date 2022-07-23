import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Length } from 'class-validator';

export class ChangeForgotPasswordDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  readonly username: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  readonly verificationCode: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @Length(3, 50)
  readonly newPassword: string;
}
