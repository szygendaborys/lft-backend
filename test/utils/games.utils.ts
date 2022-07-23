import { getConnection } from 'typeorm';
import { UserGames } from '../../src/games/userGames.entity';
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
  return getConnection().getRepository(UserGames).save(createUserGames(opts));
}
