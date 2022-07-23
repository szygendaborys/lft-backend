import { NotFoundException } from '@nestjs/common';

export class LeagueRoomApplicationNotFoundException extends NotFoundException {
  constructor() {
    super(`League room application was not found.`);
  }
}
