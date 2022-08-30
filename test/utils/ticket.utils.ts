import * as faker from 'faker';
import { Ticket } from '../../src/ticket/ticket.entity';
import { TicketType } from '../../src/ticket/ticket.types';
import { testDataSource } from '../test.module';

export const getRandomTicketType = () =>
  faker.random.arrayElement([
    TicketType.Bug,
    TicketType.Question,
    TicketType.Request,
    TicketType.Suggestion,
  ]);

export const createRandomTicket = (opts?: Partial<Ticket>): Ticket =>
  new Ticket({
    message: faker.random.words(),
    type: getRandomTicketType(),
    ...opts,
  });

export const saveTicket = (opts?: Partial<Ticket>): Promise<Ticket> =>
  testDataSource.getRepository(Ticket).save(createRandomTicket(opts));
