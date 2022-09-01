import { Request } from 'express';
import { User } from '../users/user.entity';

export interface RequestWithUser extends Request {
  user: User;
  params: Record<string, any>;
  url: string;
  method: string;
  query: Record<string, any>;
  body: Record<string, any>;
}
