import { BadRequestException } from '@nestjs/common';

export class LeagueUserAlreadyCreatedException extends BadRequestException {
  constructor() {
    super(`League account has already been created.`);
  }
}
