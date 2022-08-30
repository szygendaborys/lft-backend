import { ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { Socket } from 'socket.io';
import { UserRepository } from '../users/user.repository';
import { UnauthorizedWsException } from './exceptions/unathorized.ws-exception';
import { IS_PUBLIC_KEY } from './public.decorator';

@Injectable()
export class JwtWebsocketsAuthGuard {
  constructor(
    private readonly reflector: Reflector,
    private readonly jwtService: JwtService,
    private readonly userRepository: UserRepository,
  ) {}

  async canActivate(context: ExecutionContext) {
    const wsContext = context.switchToWs();
    const client = wsContext.getClient();
    const token = this.getTokenFromClient(client);

    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const decoded = this.jwtService.decode(token);

    if (typeof decoded === 'string' || !decoded?.id) {
      throw new UnauthorizedWsException();
    }

    const user = await this.userRepository.findOne({
      where: { id: decoded.id },
    });

    if (!user) {
      throw new UnauthorizedWsException();
    }

    Object.assign(client, { user });

    return true;
  }

  private getTokenFromClient(client: Socket): string | undefined {
    return client.handshake?.auth?.token;
  }
}
