import { Injectable } from '@nestjs/common';
import { LeagueRoomApplication } from '../league-room-application.entity';
import { LeagueRoomApplicationsRepository } from '../league-room-applications.repository';
import { LeagueRoomApplicationHandlerStrategy } from './league-room-application.handler-strategy';

@Injectable()
export class RejectedLeagueRoomApplicationHandlerStrategy
  implements LeagueRoomApplicationHandlerStrategy {
  constructor(
    private readonly leagueRoomApplicationsRepository: LeagueRoomApplicationsRepository,
  ) {}

  async handle(leagueRoomApplication: LeagueRoomApplication): Promise<void> {
    leagueRoomApplication.rejectApplication();

    await this.leagueRoomApplicationsRepository.save(leagueRoomApplication);
  }
}
