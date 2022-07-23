import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { PageLinksDto } from '../page/page-links.dto';
import { PageMetaDto } from '../page/pageMeta.dto';

export interface Response<T> {
  data: T;
}

@Injectable()
export class PaginatedResponseInterceptor<T>
  implements NestInterceptor<T, Response<T>> {
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<Response<T>> {
    const { query } = context.getArgByIndex(0);

    return next.handle().pipe(
      map((data) => {
        if (data?.meta instanceof PageMetaDto) {
          const pageWithLinksDto = PageLinksDto.createFromInterceptor({
            query,
            meta: data.meta,
          });

          return {
            ...data,
            links: pageWithLinksDto.links,
          };
        }

        return data;
      }),
    );
  }
}
