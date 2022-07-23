import { PageLinksDto } from './page-links.dto';
import { PageMetaDto } from './pageMeta.dto';
import { PageOptionsDto } from './pageOptions.dto';
import * as faker from 'faker';
import { Order } from './page.constants';

describe('Page links dto unit tests', () => {
  it('Should provide default values', () => {
    const pageLinksDto = PageLinksDto.createFromInterceptor({
      query: {},
      meta: new PageMetaDto({
        pageOptionsDto: new PageOptionsDto(),
        itemCount: faker.datatype.number(),
      }),
    });

    expect(pageLinksDto.first).toBe(`?page=1&take=10&order=ASC`);
  });

  it('Should parse pages (no previous or next but with last)', () => {
    const page = faker.datatype.number();

    const pageLinksDto = PageLinksDto.createFromInterceptor({
      query: {
        page,
      },
      meta: {
        hasNextPage: false,
        hasPreviousPage: false,
        page,
        pageCount: page,
      } as PageMetaDto,
    });

    expect(pageLinksDto.last).toBe(`?page=${page}&take=10&order=ASC`);
    expect(pageLinksDto.first).toBe(`?page=1&take=10&order=ASC`);
    expect(pageLinksDto.previous).toBeNull();
    expect(pageLinksDto.next).toBeNull();
  });

  it('Should parse pages (previous included)', () => {
    const page = faker.datatype.number();

    const pageLinksDto = PageLinksDto.createFromInterceptor({
      query: {
        page,
      },
      meta: {
        hasPreviousPage: true,
        hasNextPage: false,
        page,
      } as PageMetaDto,
    });

    expect(pageLinksDto.previous).toBe(`?page=${page - 1}&take=10&order=ASC`);
    expect(pageLinksDto.next).toBeNull();
  });

  it('Should parse pages (next included)', () => {
    const page = faker.datatype.number();

    const pageLinksDto = PageLinksDto.createFromInterceptor({
      query: {
        page,
      },
      meta: {
        hasPreviousPage: false,
        hasNextPage: true,
        page,
      } as PageMetaDto,
    });

    expect(pageLinksDto.next).toBe(`?page=${page + 1}&take=10&order=ASC`);
    expect(pageLinksDto.previous).toBeNull();
  });

  it('Should parse take', () => {
    const take = faker.datatype.number();

    const pageLinksDto = PageLinksDto.createFromInterceptor({
      query: { take },
      meta: new PageMetaDto({
        pageOptionsDto: new PageOptionsDto(),
        itemCount: faker.datatype.number(),
      }),
    });

    expect(pageLinksDto.first).toBe(`?page=1&take=${take}&order=ASC`);
  });

  it('Should parse order', () => {
    const order = faker.random.arrayElement([Order.ASC, Order.DESC]);

    const pageLinksDto = PageLinksDto.createFromInterceptor({
      query: {
        order,
      },
      meta: new PageMetaDto({
        pageOptionsDto: new PageOptionsDto(),
        itemCount: faker.datatype.number(),
      }),
    });

    expect(pageLinksDto.first).toBe(`?page=1&take=10&order=${order}`);
  });

  it('Should parse optional q string', () => {
    const q = faker.random.word();

    const pageLinksDto = PageLinksDto.createFromInterceptor({
      query: { q },
      meta: new PageMetaDto({
        pageOptionsDto: new PageOptionsDto(),
        itemCount: faker.datatype.number(),
      }),
    });

    expect(pageLinksDto.first).toBe(`?page=1&take=10&order=ASC&q=${q}`);
  });
});
