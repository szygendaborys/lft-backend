import { UnprocessableEntityException } from '@nestjs/common';
export class UnprocessableHandlerInstanceException extends UnprocessableEntityException {
  constructor(type: string) {
    super(`Unprocessable handler instance for type: ${type}`);
  }
}
