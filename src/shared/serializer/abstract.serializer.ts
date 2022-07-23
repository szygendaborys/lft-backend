export abstract class AbstractSerializer<T, D> {
  public abstract serialize(entity: T): D;

  public serializeCollection(entities: T[]): D[] {
    return entities.map((entity) => this.serialize(entity));
  }
}
