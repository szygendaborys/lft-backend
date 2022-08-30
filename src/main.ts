import {
  ClassSerializerInterceptor,
  HttpStatus,
  Logger,
  UnprocessableEntityException,
  ValidationPipe,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory, Reflector } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import helmet from 'helmet';
import * as morgan from 'morgan';
import { RolesChecker } from '../test/utils/roles.utils';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './shared/filters/badRequest.filter';
import { QueryFailedFilter } from './shared/filters/queryFailed.error';
import { RolesGuard } from './roles/roles.guard';
import { setupSwagger } from './setup.swagger';
import { SharedModule } from './shared/shared.module';
import { PaginatedResponseInterceptor } from './shared/interceptors/paginated-response.interceptor';
import { ResponseInterceptor } from './shared/interceptors/response.interceptor';
import { SentryInterceptor } from './shared/interceptors/sentry.interceptor';
import { setupSentry } from './setup.sentry';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const configService = app.select(SharedModule).get(ConfigService);

  app.enableCors({
    allowedHeaders: ['content-type', 'authorization'],
    origin: 'http://localhost:3000',
    credentials: true,
  });

  app.use(helmet());
  app.use(morgan('combined'));

  const reflector = app.get(Reflector);

  app.useGlobalFilters(
    new HttpExceptionFilter(reflector),
    new QueryFailedFilter(reflector),
  );

  app.useGlobalInterceptors(
    new ClassSerializerInterceptor(reflector),
    new PaginatedResponseInterceptor(),
    new ResponseInterceptor(),
    new SentryInterceptor(configService),
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

  if (configService.get('NODE_ENV') !== 'production') {
    setupSwagger(app);
  }

  setupSentry(app);

  const port = +configService.get('PORT');
  await app.listen(port);
  Logger.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();
