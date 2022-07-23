import {
  createLeagueRoom,
  createLeagueRoomApplication,
} from '../../../test/utils/league.utils';
import { RIOT_API_POSITIONS } from '../riotApi/riotApi.config';
import { LEAGUE_ROOM_APPLICATION_STATUS } from './applications/league-room-applications.config';
import { LeagueRoomsSerializer } from './league-rooms.serializer';

describe('League room serializer unit tests', () => {
  let serializer: LeagueRoomsSerializer;

  beforeEach(() => {
    serializer = new LeagueRoomsSerializer();
  });
  it('Should serialize', () => {
    const leagueRoom = createLeagueRoom({
      demandedPositions: [RIOT_API_POSITIONS.JUNGLE],
      applications: [
        createLeagueRoomApplication({
          status: LEAGUE_ROOM_APPLICATION_STATUS.APPROVED,
          appliedForPosition: RIOT_API_POSITIONS.ADC,
        }),
      ],
    });

    const result = serializer.serialize(leagueRoom);

    expect(result).toMatchObject({
      id: leagueRoom.id,
      date: leagueRoom.date,
      demandedPositions: leagueRoom.demandedPositions,
      region: leagueRoom.region,
      currentPlayers: 1,
      requiredPlayers: 2,
    });
  });
});
