import { LeagueRoomApplication } from '../league-room-application.entity';

export interface LeagueRoomApplicationHandlerStrategy {
  handle(leagueRoomApplication: LeagueRoomApplication): Promise<void>;
}
