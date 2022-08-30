import * as faker from 'faker';
import { Roles } from '../../src/roles/roles.config';
import { User } from '../../src/users/user.entity';
import { testDataSource } from '../test.module';

export async function saveUser(opts?: Partial<User>) {
  return await testDataSource.getRepository(User).save(createUser(opts));
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
