import { Expose } from 'class-transformer';
import * as faker from 'faker';
import { PlainToClassSerializer } from './plain-to-class.serializer';

class Test {
  a: string;
  b?: number;
}

class TestDto {
  @Expose()
  a: string;
}

describe('Plain to class serializer unit tests', () => {
  let serializer: PlainToClassSerializer<Test, TestDto>;

  beforeEach(() => {
    serializer = new PlainToClassSerializer();
  });

  const payloads = [
    {
      given: {
        a: 'abc',
        b: 123,
      } as Test,
      expectedResult: {
        a: 'abc',
      } as TestDto,
    },
    {
      given: {
        a: 'bca',
      } as Test,
      expectedResult: {
        a: 'bca',
      } as TestDto,
    },
    {
      given: {
        c: faker.datatype.string(),
        d: faker.datatype.number(),
      },
      expectedResult: {},
    },
  ];

  it.each(payloads)('Should serialize', ({ given, expectedResult }) => {
    const result = serializer.serialize({
      payload: (given as unknown) as TestDto,
      classInstance: TestDto,
    });

    expect(result).toMatchObject(expectedResult);
  });
});
