import * as faker from 'faker';
import {
  createLeagueRoom,
  createLeagueRoomApplication,
} from '../../../test/utils/league.utils';
import { RIOT_API_POSITIONS } from '../riotApi/riotApi.config';
import { LEAGUE_ROOM_APPLICATION_STATUS } from './applications/league-room-applications.config';
import { LeagueRoomApplicationsSerializer } from './applications/league-room-applications.serializer';
import { LeagueRoomDetailsSerializer } from './league-room-details.serializer';

describe('League room serializer unit tests', () => {
  let serializer: LeagueRoomDetailsSerializer;

  const leagueRoomApplicationsSerializerMock = ({
    serializeCollection: jest.fn(),
  } as unknown) as LeagueRoomApplicationsSerializer;

  beforeEach(() => {
    jest.resetAllMocks();

    serializer = new LeagueRoomDetailsSerializer(
      leagueRoomApplicationsSerializerMock,
    );
  });
  it('Should serialize without pending applications', () => {
    const leagueRoom = createLeagueRoom({
      demandedPositions: [RIOT_API_POSITIONS.JUNGLE],
      applications: [
        createLeagueRoomApplication({
          status: LEAGUE_ROOM_APPLICATION_STATUS.APPROVED,
          appliedForPosition: RIOT_API_POSITIONS.ADC,
        }),
      ],
    });

    jest.spyOn(leagueRoomApplicationsSerializerMock, 'serializeCollection');

    const result = serializer.serialize(leagueRoom);

    expect(result).toMatchObject({
      id: leagueRoom.id,
      date: leagueRoom.date,
      description: leagueRoom.description,
      demandedPositions: leagueRoom.demandedPositions,
      region: leagueRoom.region,
      currentPlayers: 1,
      requiredPlayers: 2,
    });
    expect(
      leagueRoomApplicationsSerializerMock.serializeCollection,
    ).toHaveBeenCalled();
  });

  it('Should serialize with pending applications', () => {
    const leagueRoom = createLeagueRoom({
      demandedPositions: [RIOT_API_POSITIONS.JUNGLE],
      applications: [
        createLeagueRoomApplication({
          status: LEAGUE_ROOM_APPLICATION_STATUS.APPROVED,
          appliedForPosition: RIOT_API_POSITIONS.ADC,
        }),
      ],
    });

    jest.spyOn(leagueRoomApplicationsSerializerMock, 'serializeCollection');

    const result = serializer.serialize(Object.assign(leagueRoom));

    expect(result).toMatchObject({
      id: leagueRoom.id,
      date: leagueRoom.date,
      description: leagueRoom.description,
      demandedPositions: leagueRoom.demandedPositions,
      region: leagueRoom.region,
      currentPlayers: 1,
      requiredPlayers: 2,
    });
    expect(
      leagueRoomApplicationsSerializerMock.serializeCollection,
    ).toHaveBeenCalled();
  });
});
