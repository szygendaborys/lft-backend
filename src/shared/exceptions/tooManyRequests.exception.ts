import { HttpException, HttpStatus } from '@nestjs/common';

export class TooManyRequestsException extends HttpException {
  constructor(numberOfSecondsToWait: number) {
    super(
      `Too many requests. Please, wait ${Math.floor(
        numberOfSecondsToWait,
      )} more seconds.`,
      HttpStatus.TOO_MANY_REQUESTS,
    );
  }
}
