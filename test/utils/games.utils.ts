import { UserGames } from '../../src/games/userGames.entity';
import { testDataSource } from '../test.module';
import { createUser } from './user.utils';

export function createUserGames(opts?: Partial<UserGames>): UserGames {
  return new UserGames({
    user: createUser(),
    ...opts,
  });
}

export async function saveUserGames(
  opts?: Partial<UserGames>,
): Promise<UserGames> {
  return testDataSource.getRepository(UserGames).save(createUserGames(opts));
}
