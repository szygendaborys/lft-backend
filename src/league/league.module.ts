import { LeagueUsersSerializer } from './users/league-user.serializer';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LeagueUserRepository } from './users/league-user.repository';
import { RiotApiController } from './riotApi/riotApi.controller';
import { RiotApiService } from './riotApi/riotApi.service';
import { LeagueUsersService } from './users/league-users.service';
import { LeagueUsersController } from './users/league-users.controller';
import { UserGamesRepository } from '../games/userGames.repository';
import { UserRepository } from '../users/user.repository';
import { HttpLogger } from '../shared/loggers/http.logger';
import { LeagueRoomsRepository } from './rooms/league-rooms.repository';
import { LeagueRoomsService } from './rooms/league-rooms.service';
import { LeagueRoomsSerializer } from './rooms/league-rooms.serializer';
import { LeagueRoomsController } from './rooms/league-rooms.controller';
import { LeagueRoomDetailsSerializer } from './rooms/league-room-details.serializer';
import { AbstractPaginationSerializer } from '../shared/serializer/abstract-pagination.serializer';
import { PAGINATION_LEAGUE_ROOMS_SERIALIZER } from './rooms/league-rooms.config';
import { LeagueRoomApplicationsRepository } from './rooms/applications/league-room-applications.repository';
import { LeagueRoomApplicationsSerializer } from './rooms/applications/league-room-applications.serializer';
import { LeagueRoomApplicationsController } from './rooms/applications/league-room-applications.controller';
import { LeagueRoomApplicationsService } from './rooms/applications/league-room-applications.service';
import { LeagueRoomApplicationStrategyResolver } from './rooms/applications/league-room-application.strategy-resolver';
import { ApprovedLeagueRoomApplicationHandlerStrategy } from './rooms/applications/strategies/approved-league-room-application.handler-strategy';
import { RejectedLeagueRoomApplicationHandlerStrategy } from './rooms/applications/strategies/rejected-league-room-application.handler-strategy';
import { LeagueRoomApplicationHandlerStrategy } from './rooms/applications/strategies/league-room-application.handler-strategy';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      LeagueUserRepository,
      UserGamesRepository,
      UserRepository,
      LeagueRoomsRepository,
      LeagueRoomApplicationsRepository,
    ]),
  ],
  providers: [
    HttpLogger,
    LeagueUsersService,
    RiotApiService,
    LeagueRoomsService,
    LeagueRoomsSerializer,
    LeagueRoomDetailsSerializer,
    LeagueRoomApplicationsSerializer,
    LeagueRoomApplicationsService,
    ApprovedLeagueRoomApplicationHandlerStrategy,
    RejectedLeagueRoomApplicationHandlerStrategy,
    LeagueUsersSerializer,
    {
      provide: PAGINATION_LEAGUE_ROOMS_SERIALIZER,
      useFactory: (leagueRoomSerializer: LeagueRoomsSerializer) => {
        return new AbstractPaginationSerializer(leagueRoomSerializer);
      },
      inject: [LeagueRoomsSerializer],
    },
    {
      provide: LeagueRoomApplicationStrategyResolver,
      useFactory: (
        approvedStrategy: LeagueRoomApplicationHandlerStrategy,
        rejectedStrategy: LeagueRoomApplicationHandlerStrategy,
      ) => {
        return new LeagueRoomApplicationStrategyResolver(
          approvedStrategy,
          rejectedStrategy,
        );
      },
      inject: [
        ApprovedLeagueRoomApplicationHandlerStrategy,
        RejectedLeagueRoomApplicationHandlerStrategy,
      ],
    },
  ],
  controllers: [
    RiotApiController,
    LeagueUsersController,
    LeagueRoomsController,
    LeagueRoomApplicationsController,
  ],
  exports: [RiotApiService],
})
export class LeagueModule {}
