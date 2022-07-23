import { Transform } from 'class-transformer';
import { castArray, isNil } from 'lodash';

/**
 * @description transforms to array, specially for query params
 * @example
 * @IsNumber()
 * @ToArray()
 * name: number;
 * @constructor
 */
export function ToArray(): (target: any, key: string) => void {
  return Transform(
    (params) => {
      const value = params.value;
      if (isNil(value)) {
        return [];
      }
      return castArray(value);
    },
    { toClassOnly: true },
  );
}
