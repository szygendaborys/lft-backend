import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { Games } from '../../games/games';

@Entity()
export class GameConfig {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', enum: Games })
  key: Games;

  @Column({ length: 200 })
  name: string;

  @Column({ length: 500, nullable: true })
  description: string;

  @Column({ length: 500 })
  logo: string;

  @Column({ nullable: true })
  href: string | null;

  @Column({ default: false })
  isActive: boolean;
}
