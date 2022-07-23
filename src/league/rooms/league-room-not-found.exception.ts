import { NotFoundException } from '@nestjs/common';

export class LeagueRoomNotFoundException extends NotFoundException {
  constructor() {
    super(`League room was not found.`);
  }
}
