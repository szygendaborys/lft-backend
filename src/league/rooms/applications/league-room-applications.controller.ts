import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiTags,
  ApiUnprocessableEntityResponse,
} from '@nestjs/swagger';
import { Roles } from '../../../roles/roles.config';
import { Role } from '../../../roles/roles.decorator';
import { LeagueRoomGuard } from '../league-room-owner.guard';
import { RoomOwnerOnly } from '../room-owner-only.decorator';
import { CreateLeagueRoomApplicationDto } from './dto/create-league-room-application.dto';
import { GetLeagueRoomApplicationQueryDto } from './dto/get-league-room-application.query.dto';
import { LeagueRoomApplicationDto } from './dto/league-room-application.dto';
import { UpdateLeagueRoomApplicationDto } from './dto/update-league-room-application.dto';
import { LeagueRoomApplicationsSerializer } from './league-room-applications.serializer';
import { LeagueRoomApplicationsService } from './league-room-applications.service';

@Controller('league/rooms/:roomId/applications')
@ApiTags('league', 'games', 'rooms', 'applications')
export class LeagueRoomApplicationsController {
  constructor(
    private readonly leagueRoomApplicationsSerializer: LeagueRoomApplicationsSerializer,
    private readonly leagueRoomApplicationsService: LeagueRoomApplicationsService,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiCreatedResponse({
    type: LeagueRoomApplicationDto,
    description: 'Created league room application',
  })
  @ApiUnprocessableEntityResponse()
  @ApiNotFoundResponse({
    description: 'User, games, riot league account, or room not found',
  })
  @ApiBadRequestResponse({
    description:
      'Position applied did not exist in the league room demanded positions',
  })
  @Role(Roles.USER)
  async createNewLeagueRoomApplication(
    @Param('roomId', ParseUUIDPipe) roomId: string,
    @Body() { demandedPosition }: CreateLeagueRoomApplicationDto,
  ): Promise<LeagueRoomApplicationDto> {
    return this.leagueRoomApplicationsSerializer.serialize(
      await this.leagueRoomApplicationsService.apply({
        roomId,
        demandedPosition,
      }),
    );
  }

  @Patch(':applicationId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiNoContentResponse()
  @ApiUnprocessableEntityResponse()
  @ApiNotFoundResponse({
    description: 'User, games, riot league account, or room not found',
  })
  @Role(Roles.USER)
  @RoomOwnerOnly()
  @UseGuards(LeagueRoomGuard)
  async handleApplication(
    @Param('roomId', ParseUUIDPipe) roomId: string,
    @Param('applicationId', ParseUUIDPipe) applicationId: string,
    @Body() updateLeagueRoomApplicationDto: UpdateLeagueRoomApplicationDto,
  ): Promise<void> {
    await this.leagueRoomApplicationsService.handleApplication({
      roomId,
      applicationId,
      updateLeagueRoomApplicationDto,
    });
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({
    type: LeagueRoomApplicationDto,
    isArray: true,
    description: 'Fetched league room applications of a given status',
  })
  @ApiUnprocessableEntityResponse()
  @ApiNotFoundResponse({
    description: 'User, games, riot league account, or room not found',
  })
  @ApiForbiddenResponse({
    description: 'When user is not an owner of the room',
  })
  @Role(Roles.USER)
  async getLeagueRoomApplicationsByStatus(
    @Param('roomId', ParseUUIDPipe) roomId: string,
    @Query() { status }: GetLeagueRoomApplicationQueryDto,
  ): Promise<LeagueRoomApplicationDto[]> {
    return this.leagueRoomApplicationsSerializer.serializeCollection(
      await this.leagueRoomApplicationsService.getRoomApplicationsByStatus({
        roomId,
        status,
      }),
    );
  }
}
