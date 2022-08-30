import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import jwtDecode from 'jwt-decode';
import { ExtractJwt } from 'passport-jwt';
import { DateUtils } from '../shared/date.utils';
import { UserRepository } from './../users/user.repository';
@Injectable()
export class JwtRefreshGuard implements CanActivate {
  private static readonly RefreshHeaderName = 'refresh';

  constructor(private readonly userRepository: UserRepository) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    const jwt = ExtractJwt.fromHeader(JwtRefreshGuard.RefreshHeaderName)(
      request,
    );

    if (!jwt) {
      throw new UnauthorizedException();
    }

    const decoded: { expiresAt: number; id: string } = jwtDecode(jwt);

    if (!decoded || DateUtils.checkIfTimestampExpired(decoded.expiresAt)) {
      throw new UnauthorizedException();
    }

    const user = await this.userRepository.findOneById(decoded.id);

    if (!user) {
      throw new UnauthorizedException();
    }

    Object.assign(request, { user });

    return true;
  }
}
