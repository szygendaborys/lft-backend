import { JwtService } from '@nestjs/jwt';
import { AppConfig } from '../shared/services/app.config';
import { UsersContext } from './users.context';

export function usersContextMiddleware(appConfig: AppConfig): any {
  return (req, res, next) => {
    const token = req?.headers?.authorization?.split('Bearer ')?.[1];

    const userJwt = new JwtService({ privateKey: appConfig.jwt.secret }).decode(
      token,
    );

    //@ts-ignore
    UsersContext.set(userJwt?.id);

    next();
  };
}
