import { Request } from 'express';
import * as faker from 'faker';
import { createUser } from '../../test/utils/user.utils';
import { AppConfig } from '../shared/services/app.config';
import { UserRepository } from '../users/user.repository';
import { JwtStrategy } from './jwt.strategy';

describe('JWT unit tests', () => {
  const mockAppConfig = {
    jwt: {
      secret: faker.random.word(),
    },
  } as AppConfig;

  const mockUserRepository = {
    findOne: jest.fn(),
  } as unknown as UserRepository;

  describe('strategy unit tests', () => {
    let strategy: JwtStrategy;

    beforeEach(() => {
      strategy = new JwtStrategy(mockAppConfig, mockUserRepository);
    });

    it('should not pass - exp time passed', async () => {
      const given = {
        iat: faker.datatype.number(),
        exp: faker.datatype.number(),
        id: faker.datatype.uuid(),
        expiresAt: Date.now() - faker.datatype.number(),
      };

      jest
        .spyOn(mockUserRepository, 'findOne')
        .mockResolvedValue(createUser({ id: given.id }));

      expect(async () =>
        strategy.validate({} as Request, given),
      ).rejects.toThrowError();
    });

    it('should not pass - no user found', async () => {
      const given = {
        iat: faker.datatype.number(),
        exp: new Date(Date.now() + faker.datatype.number()),
        id: faker.datatype.uuid(),
        expiresAt: faker.datatype.number(),
      };

      jest.spyOn(mockUserRepository, 'findOne').mockResolvedValue(undefined);

      expect(async () =>
        strategy.validate({} as Request, given),
      ).rejects.toThrowError();
    });

    it('should pass', async () => {
      const given = {
        iat: faker.datatype.number(),
        exp: new Date(Date.now() + faker.datatype.number()),
        id: faker.datatype.uuid(),
        expiresAt: Date.now() + faker.datatype.number(),
      };

      jest
        .spyOn(mockUserRepository, 'findOne')
        .mockResolvedValue(createUser({ id: given.id }));

      const result = await strategy.validate({} as Request, given);

      expect(result).toMatchObject({
        id: given.id,
      });
      expect(result.id).toBe(given.id);
    });
  });
});
