import { NotFoundException } from '@nestjs/common';

export class SendgridTemplateIdNotFoundException extends NotFoundException {
  constructor() {
    super(`Sendgrid template id not found.`);
  }
}
