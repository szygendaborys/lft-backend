import { NotificationStatus } from './../shared/notification/notification.status';
import { MailHandler } from './../shared/notification/handlers/mail.handler';
import { NotificationEntity } from './../shared/notification/notification.entity';
import { HttpStatus, INestApplication } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import * as faker from 'faker';
import { getRepository } from 'typeorm';
import {
  authHeaderJwt,
  clearSchema,
  compileTestingModule,
  init,
  makeRequest,
  refreshHeaderJwt,
} from '../../test/test.module';
import { RolesChecker } from '../../test/utils/roles.utils';
import { composeWithBaseUrl } from '../../test/utils/test.utils';
import { saveUser } from '../../test/utils/user.utils';
import { UserGames } from '../games/userGames.entity';
import { Roles } from '../roles/roles.config';
import { Mailer } from '../shared/mailer/mailer';
import { NotificationTypes } from '../shared/notification/notification.config';
import { User } from './user.entity';
import { UserModule } from './user.module';

describe('User integration tests', () => {
  let app: INestApplication;
  let rolesChecker: RolesChecker;

  const ROUTE = '/api/v1/users';

  beforeAll(async () => {
    const module = await compileTestingModule([UserModule]);

    app = await init(module);
    rolesChecker = module.get<RolesChecker>(RolesChecker);
  });

  beforeEach(async () => {
    jest.resetAllMocks();
    jest.spyOn(rolesChecker, 'check').mockRestore();
    await clearSchema();
  });

  afterAll(async () => {
    await app.close();
  });

  describe(`GET /api/v1/users/me `, () => {
    it('called with proper roles', async () => {
      const user = await saveUser();

      jest.spyOn(rolesChecker, 'check');

      await makeRequest(app)
        .get(`${ROUTE}/me`)
        .set(
          authHeaderJwt({
            id: user.id,
          }),
        );

      expect(rolesChecker.check).toBeCalledWith(Roles.USER, Roles.USER);
    });

    it('401 - fake user', async () => {
      const res = await makeRequest(app)
        .get(`${ROUTE}/me`)
        .set(
          authHeaderJwt({
            id: faker.datatype.uuid(),
          }),
        );

      expect(res.status).toBe(HttpStatus.UNAUTHORIZED);
    });
    it('401 - no permissions', async () => {
      const res = await makeRequest(app).get(`${ROUTE}/me`);

      expect(res.status).toBe(HttpStatus.UNAUTHORIZED);
    });

    it('200', async () => {
      const user = await saveUser();

      const res = await makeRequest(app)
        .get(`${ROUTE}/me`)
        .set(
          authHeaderJwt({
            id: user.id,
          }),
        );

      expect(res.status).toBe(HttpStatus.OK);
    });
  });

  describe(`POST ${ROUTE} - create account`, () => {
    const validPassword = 'thisIsMyValidPwd123!';
    const invalidDtos = [
      {
        username: '',
        password: validPassword,
        email: faker.internet.email(faker.random.word(), faker.random.word()),
      },
      {
        username: faker.internet.userName(
          faker.random.word(),
          faker.random.word(),
        ),
        password: '',
        email: faker.internet.email(faker.random.word(), faker.random.word()),
      },
      {
        username: faker.internet.userName(
          faker.random.word(),
          faker.random.word(),
        ),
        password: validPassword,
        fakeData: faker.random.word(),
      },
    ];

    it.each(invalidDtos)('422', async (dto) => {
      const res = await makeRequest(app).post(`${ROUTE}`).send(dto);
      expect(res.status).toBe(HttpStatus.UNPROCESSABLE_ENTITY);
    });

    it('201', async () => {
      const given = {
        username: faker.internet.userName(
          faker.random.word(),
          faker.random.word(),
        ),
        password: validPassword,
        email: faker.internet.email(faker.random.word(), faker.random.word()),
      };
      const res = await makeRequest(app).post(`${ROUTE}`).send(given);

      const savedUser = await getRepository(User).findOne();
      const savedGames = await getRepository(UserGames).findOne();

      expect(res.status).toBe(HttpStatus.CREATED);
      expect(res.body.data).toMatchObject({
        id: expect.any(String),
        username: given.username,
      });
      expect(savedUser).toMatchObject({
        username: given.username,
      });
      expect(savedGames).toBeDefined();
    });
  });

  describe(`POST ${ROUTE}/login`, () => {
    const validPassword = 'thisIsMyValidPwd123!';
    const invalidLogins = [
      {
        username: '',
        password: validPassword,
      },
      {
        username: faker.internet.userName(),
        password: '',
      },
      {
        username: faker.internet.userName(),
        fakeProp: validPassword,
      },
    ];

    it.each(invalidLogins)('422', async (invalidLogin) => {
      const res = await makeRequest(app)
        .post(`${ROUTE}/login`)
        .send(invalidLogin);
      expect(res.status).toBe(HttpStatus.UNPROCESSABLE_ENTITY);
    });

    it('200', async () => {
      const given = {
        username: faker.internet.userName(),
        password: validPassword,
      };

      const user = await saveUser({
        username: given.username,
        password: given.password,
      });

      const res = await makeRequest(app).post(`${ROUTE}/login`).send(given);

      expect(res.status).toBe(HttpStatus.OK);
      expect(res.body.data).toMatchObject({
        user: {
          id: user.id,
          username: given.username,
        },
        accessToken: {
          expiresAt: expect.any(Number),
          token: expect.any(String),
        },
        refreshToken: expect.objectContaining({
          token: expect.any(String),
        }),
      });
    });
  });

  describe(`GET ${ROUTE}/refresh`, () => {
    it('401', async () => {
      const res = await makeRequest(app)
        .get(`${ROUTE}/refresh`)
        .set(authHeaderJwt({ id: faker.datatype.uuid() }));

      expect(res.status).toBe(HttpStatus.UNAUTHORIZED);
    });

    it('401 - no header', async () => {
      const res = await makeRequest(app).get(`${ROUTE}/refresh`);

      expect(res.status).toBe(HttpStatus.UNAUTHORIZED);
    });
    it('200', async () => {
      const user = await saveUser();

      const res = await makeRequest(app)
        .get(`${ROUTE}/refresh`)
        .set(refreshHeaderJwt({ id: user.id }));

      expect(res.status).toBe(HttpStatus.OK);
      expect(res.body.data).toMatchObject({
        expiresAt: expect.any(Number),
        token: expect.any(String),
      });
    });
  });

  describe(`PATCH /api/v1/users/me`, () => {
    const getRoute = () => `/api/v1/users/me`;

    const invalidEntries = [
      {
        password: faker.datatype.number(),
      },
      {
        password: faker.datatype.string(51),
      },
      {
        password: faker.datatype.string(2),
      },
    ];
    it('called with proper roles', async () => {
      const user = await saveUser();

      jest.spyOn(rolesChecker, 'check');

      await makeRequest(app)
        .patch(getRoute())
        .set(
          authHeaderJwt({
            id: user.id,
          }),
        )
        .send({ password: faker.datatype.string() });

      expect(rolesChecker.check).toBeCalledWith(Roles.USER, Roles.USER);
    });

    it.each(invalidEntries)('422', async (invalidEntry) => {
      const user = await saveUser();

      const res = await makeRequest(app)
        .patch(getRoute())
        .set(
          authHeaderJwt({
            id: user.id,
          }),
        )
        .send(invalidEntry);

      expect(res.status).toBe(HttpStatus.UNPROCESSABLE_ENTITY);
    });

    it('401 - user not found', async () => {
      const res = await makeRequest(app)
        .patch(getRoute())
        .set(
          authHeaderJwt({
            id: faker.datatype.uuid(),
          }),
        )
        .send({
          password: faker.datatype.string(),
        });

      expect(res.status).toBe(HttpStatus.UNAUTHORIZED);
    });

    it('401 - invalid old password', async () => {
      const user = await saveUser();

      const given = {
        oldPassword: faker.datatype.string(),
        password: faker.datatype.string(),
      };

      const res = await makeRequest(app)
        .patch(getRoute())
        .set(
          authHeaderJwt({
            id: user.id,
          }),
        )
        .send(given);

      expect(res.status).toBe(HttpStatus.UNAUTHORIZED);
    });

    it('401', async () => {
      const res = await makeRequest(app)
        .patch(getRoute())
        .set({ Authorization: faker.datatype.string() })
        .send({ password: faker.datatype.string() });

      expect(res.status).toBe(HttpStatus.UNAUTHORIZED);
    });

    it('204 - changed password', async () => {
      const oldPassword = faker.datatype.string();

      const user = await saveUser({
        password: oldPassword,
      });

      const given = {
        oldPassword,
        password: faker.datatype.string(),
      };

      const res = await makeRequest(app)
        .patch(getRoute())
        .set(
          authHeaderJwt({
            id: user.id,
          }),
        )
        .send(given);

      const { password } = await getRepository(User).findOne();

      expect(res.status).toBe(HttpStatus.NO_CONTENT);
      expect(bcrypt.compareSync(given.password, password)).toBeTruthy();
    });

    it('204 - but should not change username', async () => {
      const oldPassword = faker.datatype.string();
      const user = await saveUser({
        password: oldPassword,
      });

      const given = {
        oldPassword,
        username: faker.datatype.string(),
      };

      const res = await makeRequest(app)
        .patch(getRoute())
        .set(
          authHeaderJwt({
            id: user.id,
          }),
        )
        .send(given);

      const { username } = await getRepository(User).findOne();

      expect(res.status).toBe(HttpStatus.NO_CONTENT);
      expect(username).toBe(user.username);
    });
  });

  describe(`POST /api/v1/users/forgot-password - send verification code`, () => {
    const getRoute = () => composeWithBaseUrl(`/users/forgot-password`);
    let mailer: Mailer;

    beforeEach(() => {
      mailer = app.get<Mailer>(Mailer);
    });

    it('422', async () => {
      const res = await makeRequest(app).post(getRoute()).send({
        username: faker.datatype.number(),
      });

      expect(res.status).toBe(HttpStatus.UNPROCESSABLE_ENTITY);
    });

    it('429', async () => {
      const user = await saveUser();

      await makeRequest(app).post(getRoute()).send({
        username: user.username,
      });

      const res = await makeRequest(app).post(getRoute()).send({
        username: user.username,
      });

      expect(res.status).toBe(HttpStatus.TOO_MANY_REQUESTS);
    });

    it('204 - should not call mailer as user does not exist', async () => {
      const res = await makeRequest(app).post(getRoute()).send({
        username: faker.random.word(),
      });

      expect(mailer.sendMail).not.toHaveBeenCalled();
      expect(res.status).toBe(HttpStatus.CREATED);
    });

    it('204 - email sent', async () => {
      const user = await saveUser();
      const res = await makeRequest(app).post(getRoute()).send({
        username: user.username,
      });

      const userWithVerificationCode = await getRepository(User).findOne();

      expect(res.status).toBe(HttpStatus.CREATED);
      expect(mailer.sendMail).toHaveBeenCalledWith({
        email: user.email,
        type: NotificationTypes.resetPasswordConfirmationLink,
        data: {
          verificationCode:
            userWithVerificationCode.resetPasswordVerificationCode,
        },
      });
    });

    it('204 - should create a notification in the db', async () => {
      const user = await saveUser();
      const res = await makeRequest(app).post(getRoute()).send({
        username: user.username,
      });

      const notification = await getRepository(NotificationEntity).findOne({
        relations: ['user'],
      });

      expect(res.status).toBe(HttpStatus.CREATED);
      expect(notification).toMatchObject({
        type: NotificationTypes.resetPasswordConfirmationLink,
        handlers: [MailHandler.name],
        status: NotificationStatus.PROCESSED,
        retries: 1,
        user: expect.objectContaining({
          id: user.id,
        }),
        data: {
          verificationCode: expect.any(String),
        },
      });
    });
  });

  describe(`PATCH /api/v1/users/forgot-password - forgot reset password confirmation`, () => {
    const getRoute = () => composeWithBaseUrl(`/users/forgot-password`);

    const invalidPayloads = [
      {
        username: faker.datatype.number(),
        verificationCode: faker.random.word(),
        newPassword: faker.random.word(),
      },
      {
        username: faker.random.word(),
        verificationCode: faker.datatype.number(),
        newPassword: faker.random.word(),
      },
      {
        username: faker.random.word(),
        verificationCode: faker.random.word(),
        newPassword: faker.datatype.number(),
      },
    ];

    it('429', async () => {
      const user = await saveUser();

      await makeRequest(app).patch(getRoute()).send({
        username: user.username,
        verificationCode: faker.random.word(),
        newPassword: faker.random.word(),
      });

      const res = await makeRequest(app).patch(getRoute()).send({
        username: user.username,
        verificationCode: faker.random.word(),
        newPassword: faker.random.word(),
      });

      expect(res.status).toBe(HttpStatus.TOO_MANY_REQUESTS);
    });

    it.each(invalidPayloads)('422', async (invalidPayload) => {
      const res = await makeRequest(app).patch(getRoute()).send(invalidPayload);

      expect(res.status).toBe(HttpStatus.UNPROCESSABLE_ENTITY);
    });

    it('400 - should throw as user does not exist', async () => {
      const res = await makeRequest(app).patch(getRoute()).send({
        username: faker.random.word(),
        verificationCode: faker.random.word(),
        newPassword: faker.random.word(),
      });

      expect(res.status).toBe(HttpStatus.BAD_REQUEST);
    });

    it('204 - should not change user password (user didnt request it)', async () => {
      const user = await saveUser();
      const res = await makeRequest(app).patch(getRoute()).send({
        username: user.username,
        verificationCode: faker.random.word(),
        newPassword: faker.random.word(),
      });

      const notChangedUser = await getRepository(User).findOne();

      expect(res.status).toBe(HttpStatus.BAD_REQUEST);
      expect(notChangedUser.password).toBe(user.password);
    });

    it('204 - should not change user password (invalid verification code)', async () => {
      const user = await saveUser({
        resetPasswordVerificationCode: faker.datatype.string(7),
      });
      const res = await makeRequest(app).patch(getRoute()).send({
        username: user.username,
        verificationCode: faker.random.word(),
        newPassword: faker.random.word(),
      });

      const notChangedUser = await getRepository(User).findOne();

      expect(res.status).toBe(HttpStatus.BAD_REQUEST);
      expect(notChangedUser.password).toBe(user.password);
    });

    it('204 - should change user password', async () => {
      const verificationCode = faker.datatype.string(7);

      const user = await saveUser({
        resetPasswordVerificationCode: verificationCode,
      });

      const res = await makeRequest(app).patch(getRoute()).send({
        username: user.username,
        newPassword: faker.random.word(),
        verificationCode,
      });

      const changedUser = await getRepository(User).findOne();

      expect(res.status).toBe(HttpStatus.NO_CONTENT);
      expect(changedUser.password).not.toBe(user.password);
    });

    it('204 - should change user password (1 missed verification but time has already passed)', async () => {
      const verificationCode = faker.datatype.string(7);

      const user = await saveUser({
        resetPasswordVerificationCode: verificationCode,
        resetPasswordVerificationCodeSentAt: faker.date.past(),
        resetPasswordVerificationCodeVerifiedAt: faker.date.past(),
      });

      const res = await makeRequest(app).patch(getRoute()).send({
        username: user.username,
        newPassword: faker.random.word(),
        verificationCode,
      });

      const changedUser = await getRepository(User).findOne();

      expect(res.status).toBe(HttpStatus.NO_CONTENT);
      expect(changedUser.password).not.toBe(user.password);
    });
  });
});
