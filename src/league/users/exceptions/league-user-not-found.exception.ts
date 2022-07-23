import { NotFoundException } from '@nestjs/common';

export class LeagueUserNotFoundException extends NotFoundException {
  constructor() {
    super(`League user account not found.`);
  }
}
