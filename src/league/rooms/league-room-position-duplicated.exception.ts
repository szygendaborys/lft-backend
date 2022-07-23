import { UnprocessableEntityException } from '@nestjs/common';

export class LeagueRoomPositionDuplicated extends UnprocessableEntityException {
  constructor() {
    super(`Duplicated league room position in the payload.`);
  }
}
