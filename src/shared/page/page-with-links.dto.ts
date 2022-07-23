import { ApiProperty } from '@nestjs/swagger';
import { PageLinksDto } from './page-links.dto';
import { PageDto } from './page.dto';

export class PageWithLinksDto<T> extends PageDto<T> {
  @ApiProperty()
  readonly links: PageLinksDto;
}
