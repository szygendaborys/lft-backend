import { UnauthorizedException } from '@nestjs/common';

export class InvalidLoginCredentialsException extends UnauthorizedException {
  constructor() {
    super('Invalid login or password.');
  }
}
