import { NotFoundException } from '@nestjs/common';

export class RiotLeagueUserNotFoundException extends NotFoundException {
  constructor() {
    super(`Riot League Of Legends user was not found.`);
  }
}
