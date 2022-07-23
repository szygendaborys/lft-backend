import { BadRequestException } from '@nestjs/common';

export class InvalidLeagueRoomPositionException extends BadRequestException {
  constructor() {
    super(`Invalid league position applied.`);
  }
}
