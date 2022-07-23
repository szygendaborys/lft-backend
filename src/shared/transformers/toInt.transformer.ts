import { Transform } from 'class-transformer';

/**
 * @description convert string or number to integer
 * @example
 * @IsNumber()
 * @ToInt()
 * name: number;
 * @returns {(target: any, key: string) => void}
 * @constructor
 */
export function ToInt() {
  return Transform(
    (params) => {
      const value = params.value;
      return parseInt(value, 10);
    },
    { toClassOnly: true },
  );
}
