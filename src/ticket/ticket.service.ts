import { Injectable } from '@nestjs/common';
import { CreateTicketDto } from './createTicket.dto';
import { Ticket } from './ticket.entity';
import { TicketRepository } from './ticket.repository';

@Injectable()
export class TicketService {
  constructor(private readonly ticketRepository: TicketRepository) {}

  async saveTicket(dto: CreateTicketDto): Promise<Ticket> {
    const entity = new Ticket(dto);

    return this.ticketRepository.save(entity);
  }
}
