import { UnprocessableEntityException } from '@nestjs/common';

export class LeagueRoomApplicationStrategyNotImplementedException extends UnprocessableEntityException {
  constructor() {
    super(`League room application handler strategy not implemented.`);
  }
}
