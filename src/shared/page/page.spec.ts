import { PageMetaDto } from './pageMeta.dto';
import { PageOptionsDto } from './pageOptions.dto';
import * as faker from 'faker';
describe('Page unit tests', () => {
  describe('Page meta tests', () => {
    it('Page meta should be defined', () => {
      const pageOptionsDto = new PageOptionsDto({
        page: faker.datatype.number(),
        take: faker.datatype.number({
          min: 10,
          max: 50,
        }),
      });

      const pageMeta = new PageMetaDto({
        pageOptionsDto,
        itemCount: faker.datatype.number(),
      });

      expect(pageMeta).toBeDefined();
    });

    it('Page meta should have prev page', () => {
      const pageOptionsDto = new PageOptionsDto({
        page: faker.datatype.number({
          min: 2,
        }),
        take: faker.datatype.number({
          min: 10,
          max: 50,
        }),
      });

      const pageMeta = new PageMetaDto({
        pageOptionsDto,
        itemCount: faker.datatype.number(),
      });

      expect(pageMeta.hasPreviousPage).toBeTruthy();
    });

    it('Page meta should be defined', () => {
      const pageOptionsDto = new PageOptionsDto({
        page: 1,
        take: 10,
      });

      const pageMeta = new PageMetaDto({
        pageOptionsDto,
        itemCount: faker.datatype.number({
          min: 11,
        }),
      });

      expect(pageMeta.hasNextPage).toBeTruthy();
    });

    it('Page meta should be defined', () => {
      const count = faker.datatype.number();
      const take = faker.datatype.number();
      const pageOptionsDto = new PageOptionsDto({
        page: faker.datatype.number(),
        take,
      });

      const pageMeta = new PageMetaDto({
        pageOptionsDto,
        itemCount: count,
      });

      const expectedResult = Math.ceil(count / take);
      expect(pageMeta.pageCount).toBe(expectedResult);
    });
  });
});
