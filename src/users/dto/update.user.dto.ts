import { ApiPropertyOptional, PartialType, PickType } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { CreateUserDto } from './create.user.dto';

export class UpdateUserDto extends PartialType(
  PickType(CreateUserDto, ['password']),
) {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  oldPassword?: string;
}
