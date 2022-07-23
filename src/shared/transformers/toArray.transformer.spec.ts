import { plainToClass } from 'class-transformer';
import * as faker from 'faker';
import { ToArray } from './toArray.transformer';
describe('toArray transformer unit tests', () => {
  class Test {
    @ToArray()
    given: any[];
  }

  const entries = [undefined, {}, [], faker.random.word(), null];
  it.each(entries)('Should transform to array', (given) => {
    const result = plainToClass(Test, { given });
    expect(result.given).toBeInstanceOf(Array);
  });
});
