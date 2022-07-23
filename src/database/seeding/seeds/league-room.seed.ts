import { EntityManager } from 'typeorm';
import {
  randomEnum,
  takeRandomElement,
} from '../../../../test/utils/test.utils';
import { RIOT_API_POSITIONS } from '../../../league/riotApi/riotApi.config';
import { LeagueRoomApplication } from '../../../league/rooms/applications/league-room-application.entity';
import { LEAGUE_ROOM_APPLICATION_STATUS } from '../../../league/rooms/applications/league-room-applications.config';
import { LeagueRoom } from '../../../league/rooms/league-room.entity';
import { LeagueUser } from '../../../league/users/league-user.entity';
import { SeedingEntity } from '../entities/seeding.entity';
import { initialLeagueRooms } from '../fixtures/league-room.fixture';
import { Seeds } from '../seeding.config';

export default async function usersSeed(
  transactionalEntityManager: EntityManager,
) {
  await this.wipeData([LeagueRoom]);

  const savedLeagueUsers = await transactionalEntityManager
    .getRepository(LeagueUser)
    .find();

  await transactionalEntityManager.getRepository(LeagueRoom).save(
    initialLeagueRooms.map((leagueRoom) => {
      const leagueUser = takeRandomElement(savedLeagueUsers);

      leagueRoom.region = leagueUser.region;

      leagueRoom.addApplication(
        new LeagueRoomApplication({
          status: LEAGUE_ROOM_APPLICATION_STATUS.APPROVED,
          appliedForPosition: randomEnum(RIOT_API_POSITIONS),
          isOwner: true,
          leagueUser,
        }),
      );

      return leagueRoom;
    }),
  );

  await transactionalEntityManager.save(
    new SeedingEntity(Seeds.LEAGUE_ROOM_SEED),
  );
}
