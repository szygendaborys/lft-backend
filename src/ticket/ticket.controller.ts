import { Controller, Post, HttpCode, HttpStatus, Body } from '@nestjs/common';
import { ApiOkResponse, ApiUnprocessableEntityResponse } from '@nestjs/swagger';
import { Public } from '../auth/public.decorator';
import { CreateTicketDto } from './createTicket.dto';
import { Ticket } from './ticket.entity';
import { TicketService } from './ticket.service';

@Controller('tickets')
export class TicketController {
  constructor(private readonly ticketService: TicketService) {}

  @Post()
  @Public()
  @HttpCode(HttpStatus.CREATED)
  @ApiOkResponse({
    type: Ticket,
    description: 'Created ticket entity',
  })
  @ApiUnprocessableEntityResponse()
  async saveOne(@Body() createTicketDto: CreateTicketDto): Promise<Ticket> {
    return this.ticketService.saveTicket(createTicketDto);
  }
}
