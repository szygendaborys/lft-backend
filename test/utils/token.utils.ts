import { TokenPayloadDto } from '../../src/auth/dto/tokenPayload.dto';
import * as faker from 'faker';

export const createTokenPayload = (): TokenPayloadDto => {
  return {
    expiresIn: faker.datatype.number(),
    token: faker.datatype.string(),
  };
};
