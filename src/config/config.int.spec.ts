import { HttpStatus, INestApplication } from '@nestjs/common';
import * as faker from 'faker';
import {
  authHeaderJwt,
  clearSchema,
  compileTestingModule,
  init,
  makeRequest,
} from '../../test/test.module';
import { saveGameConfig } from '../../test/utils/config.utils';
import { RolesChecker } from '../auth/roles.checker';
import { saveUser } from '../../test/utils/user.utils';
import { Roles } from '../roles/roles.config';
import { ConfigsModule } from './configs.module';

describe('Config integration tests', () => {
  let app: INestApplication;
  let rolesChecker: RolesChecker;

  const ROUTE = '/api/v1/config';

  beforeAll(async () => {
    const module = await compileTestingModule([ConfigsModule]);
    app = await init(module);

    rolesChecker = module.get<RolesChecker>(RolesChecker);
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    jest.spyOn(rolesChecker, 'check').mockRestore();
    await clearSchema();
  });

  const endpoints = ['/games'];

  it.each(endpoints)('called with proper roles', async (endpoint: string) => {
    const user = await saveUser();

    jest.spyOn(rolesChecker, 'check');

    await makeRequest(app)
      .get(`${ROUTE}${endpoint}`)
      .set(
        authHeaderJwt({
          id: user.id,
        }),
      );

    expect(rolesChecker.check).toBeCalledWith(Roles.USER, Roles.USER);
  });
  it.each(endpoints)('401 - fake user', async (endpoint: string) => {
    const res = await makeRequest(app)
      .get(`${ROUTE}${endpoint}`)
      .set(
        authHeaderJwt({
          id: faker.datatype.uuid(),
        }),
      );
    expect(res.status).toBe(HttpStatus.UNAUTHORIZED);
  });
  it.each(endpoints)('401 - no permissions', async (endpoint: string) => {
    const res = await makeRequest(app).get(`${ROUTE}${endpoint}`);
    expect(res.status).toBe(HttpStatus.UNAUTHORIZED);
  });

  describe(`${ROUTE}/games`, () => {
    it('200', async () => {
      const user = await saveUser();
      const activeGame = await saveGameConfig({ isActive: true });

      await saveGameConfig({
        isActive: false,
      });

      const res = await makeRequest(app)
        .get(`${ROUTE}/games`)
        .set(
          authHeaderJwt({
            id: user.id,
          }),
        );

      expect(res.status).toBe(HttpStatus.OK);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.data).toMatchObject(
        expect.arrayContaining([
          {
            id: activeGame.id,
            key: activeGame.key,
            name: activeGame.name,
            description: activeGame.description,
            logo: activeGame.logo,
            isActive: activeGame.isActive,
            href: activeGame.href,
          },
        ]),
      );
    });
  });
});
