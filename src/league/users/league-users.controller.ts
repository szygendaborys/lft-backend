import {
  Body,
  Controller,
  Delete,
  HttpCode,
  HttpStatus,
  Patch,
  Post,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiTags,
  ApiUnprocessableEntityResponse,
} from '@nestjs/swagger';
import { AuthUser } from '../../auth/authUser.decorator';
import { Roles } from '../../roles/roles.config';
import { Role } from '../../roles/roles.decorator';
import { PlainToClassSerializer } from '../../shared/serializer/plain-to-class.serializer';
import { User } from '../../users/user.entity';
import { CreateLeagueUserDto } from './dto/create-league-user.dto';
import { LeagueUserDto } from './dto/league-user.dto';
import { UpdateLeagueUserDto } from './dto/update-league-user.dto';
import { LeagueUser } from './league-user.entity';
import { LeagueUsersService } from './league-users.service';

@Controller('league/users')
@ApiTags('league', 'games', 'users')
export class LeagueUsersController {
  constructor(
    private readonly leagueUsersService: LeagueUsersService,
    private readonly leagueUsersSerializer: PlainToClassSerializer<
      LeagueUser,
      LeagueUserDto
    >,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOkResponse({
    type: LeagueUserDto,
    description: 'Created league user dto',
  })
  @ApiUnprocessableEntityResponse()
  @ApiNotFoundResponse({
    description: 'User, games or riot league account not found',
  })
  @ApiBadRequestResponse({
    description: 'Same positions provided as main and secondary',
  })
  @Role(Roles.USER)
  async saveOne(
    @Body() createLeagueUserDto: CreateLeagueUserDto,
    @AuthUser() user: User,
  ): Promise<LeagueUserDto> {
    return this.leagueUsersSerializer.serialize({
      payload: await this.leagueUsersService.saveOne(
        createLeagueUserDto,
        user.id,
      ),
      classInstance: LeagueUserDto,
    });
  }

  @Patch('me')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiNoContentResponse()
  @ApiUnprocessableEntityResponse()
  @ApiNotFoundResponse({
    description: 'User, games or riot league account not found',
  })
  @ApiBadRequestResponse({
    description: 'Same positions provided as main and secondary',
  })
  @Role(Roles.USER)
  async updateOne(
    @Body() updateLeagueUserDto: UpdateLeagueUserDto,
    @AuthUser() user: User,
  ): Promise<void> {
    await this.leagueUsersService.updateOne(updateLeagueUserDto, user.id);
  }

  @Delete('me')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiNoContentResponse()
  @ApiNotFoundResponse({
    description: 'User league entity not found',
  })
  @Role(Roles.USER)
  async deleteLeagueUserEntity(@AuthUser() user: User): Promise<void> {
    await this.leagueUsersService.deleteLeagueUserEntity(user.id);
  }
}
