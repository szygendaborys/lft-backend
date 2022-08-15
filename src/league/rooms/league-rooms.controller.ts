import { User } from './../../users/user.entity';
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiTags,
  ApiUnprocessableEntityResponse,
} from '@nestjs/swagger';
import { AuthUser } from '../../auth/authUser.decorator';
import { Roles } from '../../roles/roles.config';
import { Role } from '../../roles/roles.decorator';
import { PageDto } from '../../shared/page/page.dto';
import { AbstractPaginationSerializer } from '../../shared/serializer/abstract-pagination.serializer';
import { CreateLeagueRoomDto } from './dto/create-league-room.dto';
import { LeagueRoomDetailsDto } from './dto/league-room-details.dto';
import { LeagueRoomDto } from './dto/league-room.dto';
import { LeagueRoomQueryDto } from './dto/league-room.query.dto';
import { SearchLeagueRoomQueryDto } from './dto/search-league-room.query.dto';
import { UpdateLeagueRoomDto } from './dto/update-league-room.dto';
import { LeagueRoomDetailsSerializer } from './league-room-details.serializer';
import { LeagueRoomGuard } from './league-room-owner.guard';
import { LeagueRoom } from './league-room.entity';
import { PAGINATION_LEAGUE_ROOMS_SERIALIZER } from './league-rooms.config';
import { LeagueRoomsSerializer } from './league-rooms.serializer';
import { LeagueRoomsService } from './league-rooms.service';
import { RoomOwnerOnly } from './room-owner-only.decorator';

@Controller('league/rooms')
@ApiTags('league', 'games', 'rooms')
export class LeagueRoomsController {
  constructor(
    private readonly leagueRoomsService: LeagueRoomsService,
    private readonly leagueRoomsSerializer: LeagueRoomsSerializer,
    private readonly leagueRoomDetailsSerializer: LeagueRoomDetailsSerializer,
    @Inject(PAGINATION_LEAGUE_ROOMS_SERIALIZER)
    private readonly paginationLeagueRoomsSerializer: AbstractPaginationSerializer<
      LeagueRoom,
      LeagueRoomDto
    >,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiCreatedResponse({
    type: LeagueRoomDto,
    description: 'Created league room',
  })
  @ApiUnprocessableEntityResponse()
  @ApiNotFoundResponse({
    description: 'User, games or riot league account not found',
  })
  @Role(Roles.USER)
  async createNewRoom(
    @Body() createLeagueRoomDto: CreateLeagueRoomDto,
    @AuthUser() user: User,
  ) {
    return this.leagueRoomsSerializer.serialize(
      await this.leagueRoomsService.createNewRoom(createLeagueRoomDto, user.id),
    );
  }

  @Get('me')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({
    type: LeagueRoomDto,
    isArray: true,
    description: 'Paginated league room that user has performed an action',
  })
  @ApiUnprocessableEntityResponse()
  @Role(Roles.USER)
  async searchUserRooms(
    @Query() pageOptionsDto: LeagueRoomQueryDto,
    @AuthUser() user: User,
  ): Promise<PageDto<LeagueRoomDto>> {
    return this.paginationLeagueRoomsSerializer.serialize(
      await this.leagueRoomsService.searchUserRooms(pageOptionsDto, user.id),
    );
  }

  @Patch(':roomId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiNoContentResponse()
  @ApiUnprocessableEntityResponse()
  @ApiForbiddenResponse({
    description: 'User not an owner of the room',
  })
  @UseGuards(LeagueRoomGuard)
  @RoomOwnerOnly()
  @Role(Roles.USER)
  async updateRoomDetails(
    @Param('roomId', ParseUUIDPipe) roomId: string,
    @Body() updateLeagueRoomDto: UpdateLeagueRoomDto,
    @AuthUser() user: User,
  ): Promise<void> {
    await this.leagueRoomsService.updateRoom({
      roomId,
      updateLeagueRoomDto,
      userId: user.id,
    });
  }

  @Get(':roomId')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({
    type: LeagueRoomDto,
    description: 'League room that user has joined',
  })
  @ApiUnprocessableEntityResponse()
  @Role(Roles.USER)
  async getRoomDetails(
    @Param('roomId', ParseUUIDPipe) roomId: string,
    @AuthUser() user: User,
  ): Promise<LeagueRoomDetailsDto> {
    return this.leagueRoomDetailsSerializer.serialize(
      await this.leagueRoomsService.getRoomDetails({ roomId, userId: user.id }),
    );
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({
    type: LeagueRoomDto,
    isArray: true,
    description: 'Paginated league room response',
  })
  @ApiUnprocessableEntityResponse()
  @Role(Roles.USER)
  async searchLeagueRooms(
    @Query() pageOptionsDto: SearchLeagueRoomQueryDto,
    @AuthUser() user: User,
  ): Promise<PageDto<LeagueRoomDto>> {
    return this.paginationLeagueRoomsSerializer.serialize(
      await this.leagueRoomsService.searchRooms(pageOptionsDto, user.id),
    );
  }

  @Delete(':roomId/me')
  @UseGuards(LeagueRoomGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiNoContentResponse()
  @ApiForbiddenResponse()
  @Role(Roles.USER)
  async leaveLeagueRoom(
    @Param('roomId', ParseUUIDPipe) roomId: string,
    @AuthUser() user: User,
  ): Promise<void> {
    await this.leagueRoomsService.leaveRoom({ roomId, userId: user.id });
  }

  @Delete(':roomId')
  @UseGuards(LeagueRoomGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiNoContentResponse()
  @ApiForbiddenResponse()
  @Role(Roles.USER)
  @RoomOwnerOnly()
  async removeLeagueRoom(
    @Param('roomId', ParseUUIDPipe) roomId: string,
    @AuthUser() user: User,
  ): Promise<void> {
    await this.leagueRoomsService.removeRoom({ roomId, userId: user.id });
  }
}
