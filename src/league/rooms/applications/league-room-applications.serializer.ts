import { Injectable } from '@nestjs/common';
import { AbstractSerializer } from '../../../shared/serializer/abstract.serializer';
import { LeagueUsersSerializer } from './../../users/league-user.serializer';
import { LeagueRoomApplicationDto } from './dto/league-room-application.dto';
import { LeagueRoomApplication } from './league-room-application.entity';

@Injectable()
export class LeagueRoomApplicationsSerializer extends AbstractSerializer<
  LeagueRoomApplication,
  LeagueRoomApplicationDto
> {
  constructor(private readonly leagueUsersSerializer: LeagueUsersSerializer) {
    super();
  }

  serialize(application: LeagueRoomApplication): LeagueRoomApplicationDto {
    return {
      id: application.id,
      status: application.status,
      appliedForPosition: application.appliedForPosition,
      isOwner: application.isOwner,
      leagueUser: application?.leagueUser
        ? this.leagueUsersSerializer.serialize(application.leagueUser)
        : null,
    };
  }
}
