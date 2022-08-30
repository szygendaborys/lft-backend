import { User } from './../users/user.entity';
import { Socket } from 'socket.io';

export interface SocketWithUser extends Socket {
  user: User;
}
