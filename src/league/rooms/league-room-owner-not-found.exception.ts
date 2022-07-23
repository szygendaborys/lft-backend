import { NotFoundException } from '@nestjs/common';

export class LeagueRoomOwnerNotFoundException extends NotFoundException {
  constructor() {
    super(`League room owner not found.`);
  }
}
