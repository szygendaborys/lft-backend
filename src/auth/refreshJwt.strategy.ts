import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AppConfig } from '../shared/services/app.config';
import { UserRepository } from '../users/user.repository';

@Injectable()
export class RefreshJwtStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh-bearer',
) {
  constructor(
    public readonly appConfig: AppConfig,
    public readonly userRepository: UserRepository,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: appConfig.jwt.secret,
      passReqToCallback: true,
    });
  }

  private async isTokenBlacklisted(token: string): Promise<boolean> {
    // return this.cacheManager.get(TOKEN_BLACKLIST(token)); TODO: Blacklisting
    return Promise.resolve(false);
  }

  async validate({ headers }: Request, { id }) {
    const token = headers?.authorization;
    if (!token || (await this.isTokenBlacklisted(token))) {
      throw new UnauthorizedException();
    }

    const user = await this.userRepository.findOne(id);
    if (!user) {
      throw new UnauthorizedException();
    }

    return user;
  }
}
