import * as faker from 'faker';
import { Roles } from '../../../roles/roles.config';
import { CreateUserDto } from '../../../users/dto/create.user.dto';

const testPassword = 'admin';
const numberOfUsers = 20;

export const initialUsers: CreateUserDto[] = [];

// admin account
const adminAccount = {
  username: testPassword,
  email: 'admin@gmail.com',
  password: testPassword,
  role: Roles.ADMIN,
};

initialUsers.push(adminAccount);

for (let i = 0; i < numberOfUsers; i++) {
  initialUsers.push({
    username: `${faker.internet.userName()}`,
    email: `${faker.internet.email()}`,
    password: testPassword,
  });
}
