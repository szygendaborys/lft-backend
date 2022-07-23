import { Entity, JoinColumn, OneToOne } from 'typeorm';
import { AbstractEntity } from '../shared/abstract.entity';
import { User } from '../users/user.entity';
import { Games } from './games';
import { LeagueUser } from '../league/users/league-user.entity';

@Entity()
export class UserGames extends AbstractEntity {
  @OneToOne(() => User, (user) => user.games, {
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
    nullable: false,
  })
  user: User;

  @OneToOne(() => LeagueUser, (ul) => ul.userGames, {
    eager: true,
    cascade: ['insert', 'update'],
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({
    name: Games.LEAGUE_OF_LEGENDS,
  })
  [Games.LEAGUE_OF_LEGENDS]: LeagueUser;

  constructor(partial: Partial<UserGames>) {
    super();
    Object.assign(this, partial);
  }
}
