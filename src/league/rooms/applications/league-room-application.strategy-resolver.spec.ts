import { LeagueRoomApplicationStrategyResolver } from './league-room-application.strategy-resolver';
import { LEAGUE_ROOM_APPLICATION_STATUS } from './league-room-applications.config';
import { LeagueRoomApplicationHandlerStrategy } from './strategies/league-room-application.handler-strategy';

describe('League Room Application Strategy Resolver unit tests', () => {
  let resolver: LeagueRoomApplicationStrategyResolver;

  let approvedStrategyMock: LeagueRoomApplicationHandlerStrategy;
  let rejectedStrategyMock: LeagueRoomApplicationHandlerStrategy;

  beforeEach(() => {
    approvedStrategyMock = {
      handle: jest.fn(),
    };

    rejectedStrategyMock = {
      handle: jest.fn(),
    };

    resolver = new LeagueRoomApplicationStrategyResolver(
      approvedStrategyMock,
      rejectedStrategyMock,
    );
  });

  it('Should call appropriate strategy', () => {
    const strategy = resolver.resolve({
      toStatus: LEAGUE_ROOM_APPLICATION_STATUS.APPROVED,
    });

    expect(strategy).toBe(approvedStrategyMock);
  });
  it('Should call appropriate strategy', () => {
    const strategy = resolver.resolve({
      toStatus: LEAGUE_ROOM_APPLICATION_STATUS.REJECTED,
    });

    expect(strategy).toBe(rejectedStrategyMock);
  });
  it.each([
    LEAGUE_ROOM_APPLICATION_STATUS.LEFT,
    LEAGUE_ROOM_APPLICATION_STATUS.PENDING,
  ])('Should throw', (toStatus) => {
    expect(() => resolver.resolve({ toStatus })).toThrow();
  });
});
