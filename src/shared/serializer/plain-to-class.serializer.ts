import { ClassConstructor, plainToClass } from 'class-transformer';
import { AbstractSerializer } from './abstract.serializer';

export class PlainToClassSerializer<T, D> extends AbstractSerializer<
  { payload: T; classInstance: ClassConstructor<D> },
  D
> {
  serialize({
    payload,
    classInstance,
  }: {
    payload: T;
    classInstance: ClassConstructor<D>;
  }): D {
    return plainToClass(classInstance, payload, {
      excludeExtraneousValues: true,
    });
  }
}
