import { plainToClass } from 'class-transformer';
import * as faker from 'faker';
import { ToInt } from './toInt.transformer';
describe('toInt transformer unit tests', () => {
  class Test {
    @ToInt()
    given: number;
  }

  const entries = [
    undefined,
    [],
    faker.random.word(),
    null,
    '2,122',
    faker.datatype.number().toString(),
    faker.datatype.number(),
    0,
  ];
  it.each(entries)('Should transform to array', (given) => {
    const result = plainToClass(Test, { given });
    expect(result.given).toBeDefined();
  });
});
