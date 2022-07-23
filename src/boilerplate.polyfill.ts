/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable @typescript-eslint/no-unused-vars */
import 'source-map-support/register';
import { Brackets, QueryBuilder, SelectQueryBuilder } from 'typeorm';
import { PageMetaDto } from './shared/page/pageMeta.dto';
import { PageOptionsDto } from './shared/page/pageOptions.dto';
import { VIRTUAL_COLUMN_KEY } from './shared/decorators/virtualColumn.key';

declare module 'typeorm' {
  interface QueryBuilder<Entity> {
    searchByString(q: string, columnNames: string[]): this;
  }

  interface SelectQueryBuilder<Entity> {
    paginate(
      this: SelectQueryBuilder<Entity>,
      pageOptionsDto: PageOptionsDto,
    ): Promise<{ data: Entity[]; meta: PageMetaDto }>;
  }
}

QueryBuilder.prototype.searchByString = function (q, columnNames) {
  if (!q) {
    return this;
  }
  this.andWhere(
    new Brackets((qb) => {
      for (const item of columnNames) {
        qb.orWhere(`${item} ILIKE :q`);
      }
    }),
  );

  this.setParameter('q', `%${q}%`);

  return this;
};

SelectQueryBuilder.prototype.paginate = async function (
  pageOptionsDto: PageOptionsDto,
) {
  const selectQueryBuilder = this.skip(pageOptionsDto.skip).take(
    pageOptionsDto.take,
  );
  const itemCount = await selectQueryBuilder.getCount();

  const { entities, raw } = await selectQueryBuilder.getRawAndEntities();

  const data = entities.map((entitiy, index) => {
    const metaInfo = Reflect.getMetadata(VIRTUAL_COLUMN_KEY, entitiy) ?? {};
    const item = raw[index];

    for (const [propertyKey, name] of Object.entries<string>(metaInfo)) {
      entitiy[propertyKey] = item[name];
    }
    return entitiy;
  });

  const meta = new PageMetaDto({
    itemCount,
    pageOptionsDto,
  });

  return { data, meta };
};
