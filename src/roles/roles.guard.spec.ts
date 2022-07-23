import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RolesChecker } from '../../test/utils/roles.utils';
import { Roles } from './roles.config';
import { RolesGuard } from './roles.guard';

describe('Roles auth guard', () => {
  const rolesChecker = new RolesChecker();
  const validEntries = [
    [
      ({
        get: () => Roles.USER,
      } as unknown) as Reflector,
      ({
        switchToHttp: () => ({
          getRequest: () => ({
            user: {
              role: Roles.USER,
            },
          }),
        }),
        getHandler: () => {},
      } as unknown) as ExecutionContext,
    ],
    [
      ({
        get: () => Roles.USER,
      } as unknown) as Reflector,
      ({
        switchToHttp: () => ({
          getRequest: () => ({
            user: {
              role: Roles.ADMIN,
            },
          }),
        }),
        getHandler: () => {},
      } as unknown) as ExecutionContext,
    ],
  ];

  const invalidEntries = [
    [
      ({
        get: () => Roles.ADMIN,
      } as unknown) as Reflector,
      ({
        switchToHttp: () => ({
          getRequest: () => ({
            user: {
              role: Roles.USER,
            },
          }),
        }),
        getHandler: () => {},
      } as unknown) as ExecutionContext,
    ],
    [
      ({
        get: () => Roles.USER,
      } as unknown) as Reflector,
      ({
        switchToHttp: () => ({
          getRequest: () => ({
            user: {
              role: Roles.BANNED,
            },
          }),
        }),
        getHandler: () => {},
      } as unknown) as ExecutionContext,
    ],
  ];

  it.each(validEntries)(
    'Should pass',
    (reflector: Reflector, ctx: ExecutionContext) => {
      const guard = new RolesGuard(reflector, rolesChecker);
      const result = guard.canActivate(ctx);
      expect(result).toBeTruthy();
    },
  );

  it.each(invalidEntries)(
    'Should not pass',
    (reflector: Reflector, ctx: ExecutionContext) => {
      const guard = new RolesGuard(reflector, rolesChecker);
      const result = guard.canActivate(ctx);
      expect(result).toBeFalsy();
    },
  );
});
