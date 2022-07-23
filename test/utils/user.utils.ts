import * as faker from 'faker';
import { getConnection } from 'typeorm';
import { Roles } from '../../src/roles/roles.config';
import { User } from '../../src/users/user.entity';

export async function saveUser(opts?: Partial<User>) {
  return await getConnection().getRepository(User).save(createUser(opts));
}

export function createUser(opts?: Partial<User>) {
  return new User({
    username: faker.random.word(),
    password: faker.random.word(),
    email: faker.internet.email(faker.random.word(), faker.random.word()),
    role: Roles.USER,
    ...opts,
  });
}
