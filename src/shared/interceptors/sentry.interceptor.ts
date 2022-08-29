import {
  CallHandler,
  ExecutionContext,
  HttpStatus,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as Sentry from '@sentry/node';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { RequestWithUser } from '../requestWithUser';

@Injectable()
export class SentryInterceptor implements NestInterceptor {
  constructor(private readonly configService: ConfigService) {}

  private readonly filteredStatusCodes = [
    HttpStatus.NOT_FOUND,
    HttpStatus.UNAUTHORIZED,
  ];

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req: RequestWithUser = context.switchToHttp().getRequest();
    return next.handle().pipe(
      tap(null, (exception) => {
        if (this.checkIfExceptionShouldBeReportedToSentry(exception)) {
          Sentry.setUser(req.user);
          Sentry.setTags({
            environment: this.configService.get('NODE_ENV'),
            url: req.url,
            method: req.method,
          });
          Sentry.setExtras({
            body: req?.body,
            params: req?.params,
            query: req?.query,
          });
          Sentry.captureException(exception);
        }
      }),
    );
  }

  private checkIfExceptionShouldBeReportedToSentry(exception) {
    return !this.filteredStatusCodes.includes(exception?.response?.statusCode);
  }
}
