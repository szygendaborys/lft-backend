import {
  CreateDateColumn,
  DeleteDateColumn,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export abstract class AbstractEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn({
    type: 'timestamp without time zone',
  })
  createdAt: Date;

  @UpdateDateColumn({
    nullable: true,
    type: 'timestamp without time zone',
  })
  updatedAt: Date | null;

  @DeleteDateColumn({
    nullable: true,
    type: 'timestamp without time zone',
  })
  deletedAt: Date | null;
}
