import { NotificationEntity } from './../src/shared/notification/notification.entity';
import '../src/boilerplate.polyfill';
// import '../src/boilerplate.polyfill'; must be the first import
import {
  ClassSerializerInterceptor,
  Global,
  HttpStatus,
  INestApplication,
  Module,
  NestModule,
  UnprocessableEntityException,
  ValidationPipe,
} from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD, Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { AuthGuard } from '@nestjs/passport';
import { Test, TestingModule, TestingModuleBuilder } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import * as als from 'async-local-storage';
import * as request from 'supertest';
import { DataSource } from 'typeorm';
import { AuthModule } from '../src/auth/auth.module';
import { JwtAuthGuard } from '../src/auth/jwt.guard';
import { GameConfig } from '../src/config/entities/game.config.entity';
import { UserGames } from '../src/games/userGames.entity';
import { LeagueRoom } from '../src/league/rooms/league-room.entity';
import { LeagueUser } from '../src/league/users/league-user.entity';
import { RolesGuard } from '../src/roles/roles.guard';
import { HttpExceptionFilter } from '../src/shared/filters/badRequest.filter';
import { QueryFailedFilter } from '../src/shared/filters/queryFailed.error';
import { AppConfig } from '../src/shared/services/app.config';
import { SharedModule } from '../src/shared/shared.module';
import { User } from '../src/users/user.entity';
import { UserSubscriber } from '../src/users/user.subscriber';
import { RolesChecker } from './utils/roles.utils';
import { TestAuthGuardJwt, TEST_SECRET } from './utils/test.auth';
import { PaginatedResponseInterceptor } from '../src/shared/interceptors/paginated-response.interceptor';
import { ResponseInterceptor } from '../src/shared/interceptors/response.interceptor';
import { LeagueRoomApplication } from '../src/league/rooms/applications/league-room-application.entity';
import { Mailer } from '../src/shared/mailer/mailer';
import * as faker from 'faker';
import { HttpService } from '@nestjs/axios';

export const TO_PROMISE = 'toPromise';
export let testDataSource: DataSource;

@Global()
@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: 'test/int/.int.env',
      isGlobal: true,
    }),
  ],
  providers: [RolesChecker],
})
export class TestModule implements NestModule {
  // TODO: later on for adding certain middlewares
  // configure(consumer: MiddlewareConsumer) {
  //   consumer.apply(Middleware).forRoutes(...routes);
  // }
  configure() {}
}

export function createTestingModule(modules: any[]): TestingModuleBuilder {
  const toPromise = jest.fn();

  const testingModule = Test.createTestingModule({
    imports: [
      AuthModule,
      TestModule,
      SharedModule,
      TypeOrmModule.forRootAsync({
        inject: [AppConfig],
        useFactory: (appConfig: AppConfig) => ({
          keepConnectionAlive: true,
          autoLoadEntities: true,
          type: 'postgres',
          host: appConfig.db.host,
          port: appConfig.db.port,
          username: appConfig.db.username,
          password: appConfig.db.password,
          database: appConfig.db.name,
          subscribers: [UserSubscriber],
          entities: [__dirname + '/../**/*.entity{.ts,.js}'],
          migrations: [__dirname + '/migrations/*{.ts,.js}'],
          synchronize: true,
          logging: ['error'],
        }),
        dataSourceFactory: async (options) => {
          const dataSource = await new DataSource(options).initialize();

          testDataSource = dataSource;

          return dataSource;
        },
      }),
      ...modules,
    ],
    providers: [
      ConfigService,
      {
        provide: TO_PROMISE,
        useValue: toPromise,
      },
      {
        provide: APP_GUARD,
        useClass: JwtAuthGuard,
      },
    ],
  });

  als.enable();

  testingModule.overrideGuard(AuthGuard('jwt')).useClass(TestAuthGuardJwt);
  testingModule.overrideProvider(HttpService).useValue({
    request: jest.fn(() => {
      return { toPromise };
    }),
  });
  testingModule.overrideProvider(Mailer).useValue({
    sendMail: jest.fn(),
  });

  return testingModule;
}

export function authHeaderJwt(opts?: { id: string }) {
  return {
    Authorization: `Bearer ${jwtService.sign({
      id: opts.id,
    })}`,
  };
}

export function refreshHeaderJwt(opts?: { id?: string; expiresAt?: number }) {
  return {
    refresh: jwtService.sign({
      id: opts.id ?? faker.datatype.uuid(),
      expiresAt:
        opts?.expiresAt ?? Date.now() + faker.datatype.number() * 10000,
    }),
  };
}

export async function init(
  moduleFixture: TestingModule,
): Promise<INestApplication> {
  const app = moduleFixture.createNestApplication();

  const reflector = app.get(Reflector);

  app.useGlobalFilters(
    new HttpExceptionFilter(reflector),
    new QueryFailedFilter(reflector),
  );

  app.useGlobalInterceptors(
    new ClassSerializerInterceptor(reflector),
    new PaginatedResponseInterceptor(),
    new ResponseInterceptor(),
  );

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
      transform: true,
      exceptionFactory: (errors) => new UnprocessableEntityException(errors),
    }),
  );

  const rolesChecker = app.get<RolesChecker>(RolesChecker);
  app.useGlobalGuards(new RolesGuard(reflector, rolesChecker));

  await app.init();

  return app;
}

export async function compileTestingModule(
  modules: any[],
): Promise<TestingModule> {
  const testingModule = createTestingModule(modules);
  return testingModule.compile();
}

export function makeRequest(app: INestApplication) {
  return request(app.getHttpServer());
}

export const jwtService = new JwtService({
  secret: TEST_SECRET,
});

export async function clearSchema() {
  await testDataSource
    .createQueryBuilder()
    .delete()
    .from(NotificationEntity)
    .execute();
  await testDataSource
    .createQueryBuilder()
    .delete()
    .from(LeagueRoomApplication)
    .execute();
  await testDataSource.createQueryBuilder().delete().from(LeagueRoom).execute();
  await testDataSource.createQueryBuilder().delete().from(User).execute();
  await testDataSource.createQueryBuilder().delete().from(UserGames).execute();
  await testDataSource.createQueryBuilder().delete().from(LeagueUser).execute();
  await testDataSource.createQueryBuilder().delete().from(GameConfig).execute();
}
