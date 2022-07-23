import { Injectable } from '@nestjs/common';
import { EntityManager, getConnection } from 'typeorm';
import { LeagueRoom } from '../../league-room.entity';
import { LeagueRoomApplication } from '../league-room-application.entity';
import { LeagueRoomApplicationHandlerStrategy } from './league-room-application.handler-strategy';

@Injectable()
export class ApprovedLeagueRoomApplicationHandlerStrategy
  implements LeagueRoomApplicationHandlerStrategy {
  async handle(leagueRoomApplication: LeagueRoomApplication): Promise<void> {
    leagueRoomApplication.approveApplication();

    const { room } = leagueRoomApplication;

    await getConnection()
      .createEntityManager()
      .transaction(async (entityManager: EntityManager) => {
        await entityManager
          .getRepository(LeagueRoomApplication)
          .save(leagueRoomApplication);
        await entityManager.getRepository(LeagueRoom).save({
          id: room.id,
          demandedPositions: room.demandedPositions,
        });
      });
  }
}
