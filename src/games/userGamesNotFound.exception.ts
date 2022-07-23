import { NotFoundException } from '@nestjs/common';

export class UserGamesNotFoundException extends NotFoundException {
  constructor() {
    super(`User games were not found.`);
  }
}
