import { PageDto } from '../page/page.dto';
import { AbstractSerializer } from './abstract.serializer';

export class AbstractPaginationSerializer<T, D> {
  constructor(private readonly serializer: AbstractSerializer<T, D>) {}

  serialize({ data, meta }: PageDto<T>): PageDto<D> {
    return new PageDto<D>(this.serializer.serializeCollection(data), meta);
  }
}
