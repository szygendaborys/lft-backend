import { plainToClass } from 'class-transformer';
import { IPaginationLinks } from './IPagination.interface';
import { PageMetaDto } from './pageMeta.dto';
import { PageOptionsDto } from './pageOptions.dto';

export class PageLinksDto implements IPaginationLinks {
  first: string;
  previous: string | null = null;
  next: string | null = null;
  last: string;

  static createFromInterceptor({
    query,
    meta,
  }: {
    query: Record<string, any>;
    meta: PageMetaDto;
  }): PageLinksDto {
    const pageOptionsDto = plainToClass(PageOptionsDto, query);

    return new PageLinksDto(pageOptionsDto, meta);
  }

  private constructor(
    private readonly pageOptionsDto: PageOptionsDto,
    private readonly meta: PageMetaDto,
  ) {
    this.createFirstLink();
    this.createLastLink();

    if (meta.hasNextPage) {
      this.createNextLink();
    }

    if (meta.hasPreviousPage) {
      this.createPreviousLink();
    }
  }

  private createFirstLink(): void {
    const query = new PageOptionsDto({
      ...this.pageOptionsFlyweight,
      page: 1,
    });

    this.first = this.buildQuery(query);
  }

  private createLastLink(): void {
    const query = new PageOptionsDto({
      ...this.pageOptionsFlyweight,
      page: this.meta.pageCount,
    });

    this.last = this.buildQuery(query);
  }

  private createNextLink(): void {
    const query = new PageOptionsDto({
      ...this.pageOptionsFlyweight,
      page: this.pageOptionsDto.page + 1,
    });

    this.next = this.buildQuery(query);
  }

  private createPreviousLink(): void {
    const query = new PageOptionsDto({
      ...this.pageOptionsFlyweight,
      page: this.pageOptionsDto.page - 1,
    });

    this.previous = this.buildQuery(query);
  }

  private buildQuery(query: PageOptionsDto): string {
    return query.getStringifiedQuery();
  }

  get pageOptionsFlyweight() {
    return {
      order: this.pageOptionsDto.order,
      take: this.pageOptionsDto.take,
      page: this.pageOptionsDto.page,
      ...(this.pageOptionsDto.q && { q: this.pageOptionsDto.q }),
    };
  }

  get links(): {
    first: string;
    last: string;
    next: string | null;
    previous: string | null;
  } {
    return {
      first: this.first,
      last: this.last,
      next: this.next,
      previous: this.previous,
    };
  }
}
