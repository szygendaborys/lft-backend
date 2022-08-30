import { LeagueRoomApplicationsRepository } from './applications/league-room-applications.repository';
import { ExecutionContext, Injectable } from '@nestjs/common';
import { UnauthorizedWsException } from '../../auth/exceptions/unathorized.ws-exception';
import { SocketWithUser } from '../../shared/socketWithUser';
import { LEAGUE_ROOM_APPLICATION_STATUS } from './applications/league-room-applications.config';

@Injectable()
export class WsLeagueRoomDetailsGuard {
  constructor(
    private readonly leagueRoomApplicationsRepository: LeagueRoomApplicationsRepository,
  ) {}

  async canActivate(context: ExecutionContext) {
    const wsContext = context.switchToWs();
    const data = wsContext.getData();
    const client: SocketWithUser = wsContext.getClient();

    if (
      !client.user ||
      !client.user?.games?.league_of_legends ||
      !data.roomId
    ) {
      throw new UnauthorizedWsException();
    }

    const leagueUser = client.user.games.league_of_legends;

    const roomApplication =
      await this.leagueRoomApplicationsRepository.findByLeagueUserAndRoomId({
        roomId: data.roomId,
        leagueUser,
      });

    if (
      !roomApplication ||
      roomApplication.status !== LEAGUE_ROOM_APPLICATION_STATUS.APPROVED
    ) {
      throw new UnauthorizedWsException();
    }

    return true;
  }
}
