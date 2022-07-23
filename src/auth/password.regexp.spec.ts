import { passwordRegexp } from './password.regexp';
import * as faker from 'faker';
describe('Password regexp unit test', () => {
  const validEntries = ['Test111!!!@', 'Test5!', 'testinGpwd123'];
  const invalidEntries = [
    faker.datatype.number(),
    faker.random.word(),
    '',
    faker.datatype.boolean(),
    'Tt1!',
    'tt1',
    'Ttt',
    faker.random.words(10),
  ];

  it.each(validEntries)('should validate', (password) => {
    expect(password.toString().match(passwordRegexp)).toBeTruthy();
  });

  it.each(invalidEntries)('should not validate', (password) => {
    expect(password.toString().match(passwordRegexp)).toBeFalsy();
  });
});
