import { plainToClass } from 'class-transformer';
import { Column, Entity, OneToMany, OneToOne } from 'typeorm';
import { UserGames } from '../../games/userGames.entity';
import { AbstractEntity } from '../../shared/abstract.entity';
import { Serializable } from '../../shared/serializer/serializable';
import {
  RIOT_API_POSITIONS,
  RIOT_API_REGIONS,
} from '../riotApi/riotApi.config';
import { LeagueRoomApplication } from '../rooms/applications/league-room-application.entity';
import { LeagueUserDto } from './dto/league-user.dto';

@Entity()
export class LeagueUser
  extends AbstractEntity
  implements Serializable<LeagueUserDto> {
  @OneToOne(() => UserGames, (ug) => ug.league_of_legends, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  userGames: UserGames;

  @Column({ type: 'varchar', length: 255 })
  summonerId: string;

  @Column({ enum: RIOT_API_REGIONS })
  region: RIOT_API_REGIONS;

  @Column({ enum: RIOT_API_POSITIONS })
  mainPosition: RIOT_API_POSITIONS;

  @Column({ enum: RIOT_API_POSITIONS })
  secondaryPosition: RIOT_API_POSITIONS;

  @OneToMany(() => LeagueRoomApplication, (lra) => lra.leagueUser, {
    cascade: true,
  })
  leagueRoomApplications: LeagueRoomApplication[];

  constructor(partial: Partial<LeagueUser>) {
    super();
    Object.assign(this, partial);
  }

  serialize(): LeagueUserDto {
    return plainToClass(LeagueUserDto, this, {
      excludeExtraneousValues: true,
    });
  }

  setSummonerId(summonerId: string): void {
    this.summonerId = summonerId;
  }
}
