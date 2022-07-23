import { Injectable } from '@nestjs/common';
import { UpdateLeagueRoomApplicationDto } from './dto/update-league-room-application.dto';
import { LEAGUE_ROOM_APPLICATION_STATUS } from './league-room-applications.config';
import { LeagueRoomApplicationStrategyNotImplementedException } from './strategies/league-room-application-strategy-not-implemented.exception';
import { LeagueRoomApplicationHandlerStrategy } from './strategies/league-room-application.handler-strategy';

@Injectable()
export class LeagueRoomApplicationStrategyResolver {
  private readonly config: ReadonlyMap<
    LEAGUE_ROOM_APPLICATION_STATUS,
    LeagueRoomApplicationHandlerStrategy
  >;

  constructor(
    approvedLeagueRoomApplicationHandlerStrategy: LeagueRoomApplicationHandlerStrategy,
    rejectedLeagueRoomApplicationHandlerStrategy: LeagueRoomApplicationHandlerStrategy,
  ) {
    this.config = new Map([
      [
        LEAGUE_ROOM_APPLICATION_STATUS.APPROVED,
        approvedLeagueRoomApplicationHandlerStrategy,
      ],
      [
        LEAGUE_ROOM_APPLICATION_STATUS.REJECTED,
        rejectedLeagueRoomApplicationHandlerStrategy,
      ],
    ]);
  }

  resolve({
    toStatus,
  }: UpdateLeagueRoomApplicationDto): LeagueRoomApplicationHandlerStrategy {
    if (!this.config.has(toStatus)) {
      throw new LeagueRoomApplicationStrategyNotImplementedException();
    }

    return this.config.get(toStatus);
  }
}
