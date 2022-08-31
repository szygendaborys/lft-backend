import './boilerplate.polyfill';
// import './boilerplate.polyfill'; must be the first import
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import * as Joi from 'joi';
import { RolesChecker } from './auth/roles.checker';
import { JwtAuthGuard } from './auth/jwt.guard';
import modules from './shared/modules';
import { AppConfig } from './shared/services/app.config';
import { SharedModule } from './shared/shared.module';
import { UserSubscriber } from './users/user.subscriber';
import { DataSource } from 'typeorm';

console.log(__dirname);
@Module({
  imports: [
    ConfigModule.forRoot({
      validationSchema: Joi.object({
        NODE_ENV: Joi.string()
          .valid('development', 'production', 'staging', 'int')
          .default('development'),
        PORT: Joi.number().required().default(3000),
        POSTGRES_HOST: Joi.string().required(),
        POSTGRES_PORT: Joi.number().required(),
        POSTGRES_USER: Joi.string().required(),
        POSTGRES_PASSWORD: Joi.string().required(),
        POSTGRES_DB: Joi.string().required(),
        JWT_EXPIRATION_TIME: Joi.number().required(),
        JWT_SECRET_KEY: Joi.string().required(),
        RIOT_API_KEY: Joi.string().required(),
      }),
      validationOptions: {
        abortEarly: true,
      },
      envFilePath: '.env',
      isGlobal: true,
    }),
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
        migrations: [__dirname + '/database/migrations/*{.ts,.js}'],
        synchronize: false,
        logging: ['error'],
        migrationsRun: true,
        cli: {
          entities: [__dirname + '/../**/*.entity{.ts,.js}'],
          migrationsDir: [__dirname + '/database/migrations/*{.ts,.js}'],
        },
      }),
      dataSourceFactory: async (options) => {
        const dataSource = await new DataSource(options).initialize();
        return dataSource;
      },
    }),
    ...modules,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    RolesChecker,
  ],
})
export class AppModule {}
