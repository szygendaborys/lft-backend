import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AuthService } from '../auth/auth.service';
import { AuthUser } from '../auth/authUser.decorator';
import { LoginPayloadDto } from '../auth/dto/loginPayload.dto';
import { TokenPayloadDto } from '../auth/dto/tokenPayload.dto';
import { JwtRefreshGuard } from '../auth/jwtRefresh.guard';
import { Public } from '../auth/public.decorator';
import { Roles } from '../roles/roles.config';
import { Role } from '../roles/roles.decorator';
import { ChangeForgotPasswordDto } from './dto/change-forgot-password.dto';
import { CreateUserDto } from './dto/create.user.dto';
import { ForgotPasswordDto } from './dto/forgot.password.dto';
import { LoginUserDto } from './dto/login.user.dto';
import { UpdateUserDto } from './dto/update.user.dto';
import { UserDto } from './dto/user.dto';
import { User } from './user.entity';
import { UsersSerializer } from './users.serializer';
import { UsersService } from './users.service';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UsersService,
    private readonly userSerializer: UsersSerializer,
  ) {}

  @Public()
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOkResponse({
    type: UserDto,
    description: 'Created user dto',
  })
  async create(@Body() createUserDto: CreateUserDto) {
    return this.userSerializer.serialize(
      await this.userService.create(createUserDto),
    );
  }

  @Public()
  @Post('/login')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({
    type: LoginPayloadDto,
    description: 'User info with access token',
  })
  async login(@Body() loginUserDto: LoginUserDto) {
    const { user, accessToken, refreshToken } = await this.userService.login(
      loginUserDto,
    );

    return {
      user: this.userSerializer.serialize(user),
      accessToken,
      refreshToken,
    };
  }

  @Public()
  @Post('/forgot-password')
  @ApiCreatedResponse()
  @HttpCode(HttpStatus.CREATED)
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    await this.userService.sendResetPasswordCode(forgotPasswordDto);
  }

  @Public()
  @Patch('/forgot-password')
  @ApiNoContentResponse()
  @HttpCode(HttpStatus.NO_CONTENT)
  async changePassword(
    @Body() changeForgotPasswordDto: ChangeForgotPasswordDto,
  ) {
    await this.userService.changeForgottenPassword(changeForgotPasswordDto);
  }

  @Public()
  @Get('refresh')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtRefreshGuard)
  @ApiOkResponse({
    type: TokenPayloadDto,
    description: 'Token refresh payload',
  })
  async refreshToken(@AuthUser() user: User) {
    return this.authService.createToken(user);
  }

  @Get('me')
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @Role(Roles.USER)
  @ApiOkResponse({
    type: UserDto,
    description: 'A single user dto',
  })
  async findOne(@AuthUser() user: User): Promise<UserDto> {
    return this.userSerializer.serialize(
      await this.userService.findUser(user.id),
    );
  }

  @Patch('me')
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @Role(Roles.USER)
  @ApiNoContentResponse()
  @ApiNotFoundResponse({
    description: 'User was not found',
  })
  async updateOne(@Body() updateUserDto: UpdateUserDto): Promise<void> {
    await this.userService.update(updateUserDto);
  }
}
