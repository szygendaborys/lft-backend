import './src/boilerplate.polyfill';
import * as dotenv from 'dotenv';
import { SnakeNamingStrategy } from './src/database/snakeNaming.strategy';

if (!(<any>module).hot /* for webpack HMR */) {
  process.env.NODE_ENV = process.env.NODE_ENV || 'development';
}

dotenv.config({
  path: `.env`,
});

// Replace \\n with \n to support multiline strings in AWS
for (const envName of Object.keys(process.env)) {
  process.env[envName] = process.env[envName].replace(/\\n/g, '\n');
}

module.exports = {
  keepConnectionAlive: true,
  autoLoadEntities: true,
  type: 'postgres',
  host: process.env.POSTGRES_HOST,
  port: +process.env.POSTGRES_PORT,
  username: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DB,
  namingStrategy: new SnakeNamingStrategy(),
  entities: [__dirname + '/src/**/*.entity{.ts,.js}'],
  migrations: [__dirname + '/src/database/migrations/*{.ts,.js}'],
  synchronize: false,
  logging: ['error'],
  cli: {
    entities: [__dirname + '/src/**/*.entity{.ts,.js}'],
    migrationsDir: [__dirname + '/src/database/migrations/*{.ts,.js}'],
  },
};
