import { UnauthorizedWsException } from './exceptions/unathorized.ws-exception';
import { ExecutionContext } from '@nestjs/common';
import { UserRepository } from './../users/user.repository';
import { JwtService } from '@nestjs/jwt';
import { Reflector } from '@nestjs/core';
import { JwtWebsocketsAuthGuard } from './jwt-websockets-auth.guard';
import * as faker from 'faker';
import { createUser } from '../../test/utils/user.utils';

describe('jwtWebsocketsAuthGuard unit tests', () => {
  let guard: JwtWebsocketsAuthGuard;
  let reflectorMock: Reflector;
  let jwtServiceMock: JwtService;
  let userRepositoryMock: UserRepository;

  let context: ExecutionContext;
  let getClientMock: jest.Mock;

  beforeEach(() => {
    jest.resetAllMocks();

    reflectorMock = {
      getAllAndOverride: jest.fn(),
    } as unknown as Reflector;

    jwtServiceMock = {
      decode: jest.fn(),
    } as unknown as JwtService;

    userRepositoryMock = {
      findOne: jest.fn(),
    } as unknown as UserRepository;

    getClientMock = jest.fn(() => ({
      client: {
        handshake: {
          auth: {
            token: faker.datatype.string(),
          },
        },
      },
    }));

    context = {
      getHandler: jest.fn(),
      getClass: jest.fn(),
      switchToWs: jest.fn(() => ({
        getClient: getClientMock,
        getData: jest.fn(),
      })),
    } as unknown as ExecutionContext;

    guard = new JwtWebsocketsAuthGuard(
      reflectorMock,
      jwtServiceMock,
      userRepositoryMock,
    );
  });

  it('If route is public it should return true', async () => {
    jest.spyOn(reflectorMock, 'getAllAndOverride').mockReturnValue(true);

    const result = await guard.canActivate(context);

    expect(result).toBeTruthy();
  });

  it('should throw (no jwt token)', async () => {
    jest.spyOn(reflectorMock, 'getAllAndOverride').mockReturnValue(false);

    jest.spyOn(jwtServiceMock, 'decode').mockReturnValue(null);

    await expect(guard.canActivate(context)).rejects.toThrow(
      UnauthorizedWsException,
    );
  });

  it('should throw (no user found)', async () => {
    jest.spyOn(reflectorMock, 'getAllAndOverride').mockReturnValue(false);

    jest.spyOn(jwtServiceMock, 'decode').mockReturnValue({
      id: faker.datatype.uuid(),
    });

    jest.spyOn(userRepositoryMock, 'findOne').mockResolvedValue(null);

    await expect(guard.canActivate(context)).rejects.toThrow(
      UnauthorizedWsException,
    );
  });

  it('should pass', async () => {
    jest.spyOn(reflectorMock, 'getAllAndOverride').mockReturnValue(false);

    jest.spyOn(jwtServiceMock, 'decode').mockReturnValue({
      id: faker.datatype.uuid(),
    });

    jest.spyOn(userRepositoryMock, 'findOne').mockResolvedValue(createUser());

    const result = await guard.canActivate(context);

    expect(result).toBeTruthy();
  });
});
