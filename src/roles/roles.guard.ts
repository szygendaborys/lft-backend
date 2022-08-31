import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RolesChecker } from '../auth/roles.checker';
import { RequestWithUser } from '../shared/requestWithUser';
import { Roles, ROLES } from './roles.config';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly rolesChecker: RolesChecker,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const role = this.reflector.get<Roles>(ROLES, context.getHandler());
    if (!role) {
      return true;
    }
    const request: RequestWithUser = context.switchToHttp().getRequest();
    const user = request.user;
    return this.rolesChecker.check(role, user.role);
  }
}
