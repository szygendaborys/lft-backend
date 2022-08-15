import { UnauthorizedWsException } from './../../auth/exceptions/unathorized.ws-exception';
import { ExecutionContext } from '@nestjs/common';
import { LeagueRoomApplicationsRepository } from './applications/league-room-applications.repository';
import { WsLeagueRoomDetailsGuard } from './wsLeagueRoomDetails.guard';
import { createUser } from '../../../test/utils/user.utils';
import { createUserGames } from '../../../test/utils/games.utils';
import {
  createLeagueRoomApplication,
  createLeagueUser,
} from '../../../test/utils/league.utils';
import * as faker from 'faker';
import { LEAGUE_ROOM_APPLICATION_STATUS } from './applications/league-room-applications.config';

describe('wsLeagueRoomDetailsGuard unit tests', () => {
  let guard: WsLeagueRoomDetailsGuard;
  let repositoryMock: LeagueRoomApplicationsRepository;
  let context: ExecutionContext;

  let getDataMock: jest.Mock;
  let getClientMock: jest.Mock;

  beforeEach(() => {
    jest.restoreAllMocks();

    getDataMock = jest.fn();
    getClientMock = jest.fn();

    repositoryMock = {
      findByLeagueUserAndRoomId: jest.fn(),
    } as unknown as LeagueRoomApplicationsRepository;

    guard = new WsLeagueRoomDetailsGuard(repositoryMock);

    context = {
      switchToWs: jest.fn(() => ({
        getData: getDataMock,
        getClient: getClientMock,
      })),
    } as unknown as ExecutionContext;
  });

  it('Should throw unauthorized exception (no client)', async () => {
    getClientMock.mockResolvedValue({
      user: null,
    });

    getDataMock.mockReturnValue({
      roomId: faker.datatype.uuid(),
    });

    await expect(guard.canActivate(context)).rejects.toThrow(
      UnauthorizedWsException,
    );
  });

  it('Should throw unauthorized exception (no data)', async () => {
    getClientMock.mockReturnValue({
      user: createUser({
        games: createUserGames({
          league_of_legends: createLeagueUser(),
        }),
      }),
    });

    getDataMock.mockReturnValue({});

    await expect(guard.canActivate(context)).rejects.toThrow(
      UnauthorizedWsException,
    );
  });

  it('Should throw unauthorized exception (user does not belong to the room)', async () => {
    getClientMock.mockReturnValue({
      user: createUser({
        games: createUserGames({
          league_of_legends: createLeagueUser(),
        }),
      }),
    });

    getDataMock.mockReturnValue({
      roomId: faker.datatype.uuid(),
    });

    jest
      .spyOn(repositoryMock, 'findByLeagueUserAndRoomId')
      .mockResolvedValue(null);

    await expect(guard.canActivate(context)).rejects.toThrow(
      UnauthorizedWsException,
    );
  });

  it('Should throw unauthorized exception (user does not belong to the room (but applied))', async () => {
    getClientMock.mockReturnValue({
      user: createUser({
        games: createUserGames({
          league_of_legends: createLeagueUser(),
        }),
      }),
    });

    getDataMock.mockReturnValue({
      roomId: faker.datatype.uuid(),
    });

    jest.spyOn(repositoryMock, 'findByLeagueUserAndRoomId').mockResolvedValue(
      createLeagueRoomApplication({
        status: LEAGUE_ROOM_APPLICATION_STATUS.PENDING,
      }),
    );

    await expect(guard.canActivate(context)).rejects.toThrow(
      UnauthorizedWsException,
    );
  });

  it('Should validate', async () => {
    getClientMock.mockReturnValue({
      user: createUser({
        games: createUserGames({
          league_of_legends: createLeagueUser(),
        }),
      }),
    });

    getDataMock.mockReturnValue({
      roomId: faker.datatype.uuid(),
    });

    jest.spyOn(repositoryMock, 'findByLeagueUserAndRoomId').mockResolvedValue(
      createLeagueRoomApplication({
        status: LEAGUE_ROOM_APPLICATION_STATUS.APPROVED,
      }),
    );

    const result = await guard.canActivate(context);

    expect(result).toBeTruthy();
  });
});
