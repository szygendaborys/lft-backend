import { SetMetadata } from '@nestjs/common';
import { Roles, ROLES } from './roles.config';

export const Role = (role: Roles) => SetMetadata(ROLES, role);
