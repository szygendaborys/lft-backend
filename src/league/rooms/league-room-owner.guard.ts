import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RequestWithUser } from '../../shared/requestWithUser';
import { LeagueRoomApplicationsRepository } from './applications/league-room-applications.repository';
import { ROOM_OWNER_ONLY } from './room-owner-only.decorator';

/**
 * @description
 * Allows users to execute the request only if they are approved
 * Can be extended with a @RoomOwnerOnly decorator to restrict route being executed to only a room owner
 */
@Injectable()
export class LeagueRoomGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly leagueRoomApplicationsRepository: LeagueRoomApplicationsRepository,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const ownerOnly = this.reflector.get<boolean>(
      ROOM_OWNER_ONLY,
      context.getHandler(),
    );

    const request: RequestWithUser = context.switchToHttp().getRequest();
    const leagueUser = request.user.games.league_of_legends;
    const { roomId } = request.params;

    const application = await this.leagueRoomApplicationsRepository.findByLeagueUserAndRoomId(
      {
        roomId,
        leagueUser,
      },
    );

    if (!application || (!application.isOwner && ownerOnly)) {
      return false;
    }

    return true;
  }
}
