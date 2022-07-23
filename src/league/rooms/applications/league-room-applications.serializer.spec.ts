import { createLeagueRoomApplication } from '../../../../test/utils/league.utils';
import { LeagueUsersSerializer } from './../../users/league-user.serializer';
import { LeagueRoomApplicationsSerializer } from './league-room-applications.serializer';

describe('League room applications serializer unit tests', () => {
  let serializer: LeagueRoomApplicationsSerializer;

  const leagueUserSerializerMock = ({
    serialize: jest.fn(),
  } as unknown) as LeagueUsersSerializer;

  beforeEach(() => {
    jest.resetAllMocks();

    serializer = new LeagueRoomApplicationsSerializer(leagueUserSerializerMock);
  });

  it('Should serialize', () => {
    const leagueRoomApplication = createLeagueRoomApplication();

    jest.spyOn(leagueUserSerializerMock, 'serialize');

    const result = serializer.serialize(leagueRoomApplication);

    expect(result).toMatchObject({
      id: leagueRoomApplication.id,
      status: leagueRoomApplication.status,
      appliedForPosition: leagueRoomApplication.appliedForPosition,
      isOwner: leagueRoomApplication.isOwner,
    });
    expect(leagueUserSerializerMock.serialize).toHaveBeenCalled();
  });
});
