import { Injectable } from '@nestjs/common';
import { Roles } from '../roles/roles.config';

@Injectable()
export class RolesChecker {
  check(role: Roles, userRole: Roles): boolean {
    return userRole >= role;
  }
}
