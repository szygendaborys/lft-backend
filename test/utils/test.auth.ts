/* eslint @typescript-eslint/no-unused-vars: 0 */

import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { JwtUser } from '../../src/auth/interfaces/jwtUser';
import { User } from '../../src/users/user.entity';
import { UsersContext } from '../../src/users/users.context';
import { testDataSource } from '../test.module';

export const TEST_SECRET = 'test_secret';

@Injectable()
export class TestAuthGuardJwt implements CanActivate {
  jwtService: JwtService;

  constructor(private readonly reflector: Reflector) {
    this.jwtService = new JwtService({
      secret: TEST_SECRET,
    });
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }

    const req = context.switchToHttp().getRequest();
    const jwt = extractToken(req);
    if (!jwt) throw new UnauthorizedException();

    const decoded = this.jwtService.decode(jwt) as JwtUser;
    if (!decoded) throw new UnauthorizedException();

    const user = await testDataSource.getRepository(User).findOne({
      where: { id: decoded.id },
    });
    if (!user) throw new UnauthorizedException();

    req.user = user;

    console.log(user.id);
    UsersContext.set(user.id);

    return true;
  }
}

function extractToken(req: Request) {
  if (
    req.headers.authorization &&
    req.headers.authorization.split(' ')[0] === 'Bearer'
  ) {
    return req.headers.authorization.split(' ')[1];
  }
}
function IS_PUBLIC_KEY<T>(IS_PUBLIC_KEY: any, arg1: Function[]) {
  throw new Error('Function not implemented.');
}
