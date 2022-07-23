import { BadRequestException } from '@nestjs/common';
export class InvalidVerificationCodeException extends BadRequestException {
  constructor() {
    super('Verification code is invalid');
  }
}
