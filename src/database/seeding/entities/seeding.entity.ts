import { Entity, PrimaryColumn, CreateDateColumn } from 'typeorm';
import { Seeds } from '../seeding.config';

@Entity('seeding')
export class SeedingEntity {
  @PrimaryColumn({ enum: Seeds })
  public id: Seeds;

  @CreateDateColumn()
  creationDate: Date;

  constructor(id?: Seeds) {
    this.id = id;
  }
}
