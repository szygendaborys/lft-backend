import { ServiceUnavailableException } from '@nestjs/common';

export class RiotApiUnavailableException extends ServiceUnavailableException {
  constructor() {
    super('Riot API did not respond.');
  }
}
