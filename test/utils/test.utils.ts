import * as faker from 'faker';
export function randomEnum(entry: Record<string, any>) {
  const length = Object.keys(entry).length;
  const randomInt = faker.datatype.number({ min: 0, max: length - 1 });

  return Object.values(entry)[randomInt];
}

export function takeRandomElement<T>(availableElements: T[]): T {
  const takenIndex = faker.datatype.number({
    min: 0,
    max: availableElements.length - 1,
  });

  return availableElements.splice(takenIndex, 1)[0];
}

export const composeWithBaseUrl = (endpoint: string): string =>
  `/api/v1${endpoint}`;
