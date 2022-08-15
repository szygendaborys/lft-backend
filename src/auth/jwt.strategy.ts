import { DateUtils } from './../shared/date.utils';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AppConfig } from '../shared/services/app.config';
import { UserRepository } from '../users/user.repository';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
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

  async validate(req: Request, { expiresAt, id }) {
    if (DateUtils.checkIfTimestampExpired(expiresAt)) {
      throw new UnauthorizedException();
    }

    const user = await this.userRepository.findOne({ where: { id } });

    if (!user) {
      throw new UnauthorizedException();
    }

    req.user = user;

    return user;
  }
}
