import { INestApplication, HttpStatus } from '@nestjs/common';
import * as faker from 'faker';
import {
  compileTestingModule,
  init,
  clearSchema,
  makeRequest,
  testDataSource,
} from '../../test/test.module';
import {
  getRandomTicketType,
  createRandomTicket,
} from '../../test/utils/ticket.utils';
import { Ticket } from './ticket.entity';
import { TicketModule } from './ticket.module';

describe('Ticket integration tests', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const module = await compileTestingModule([TicketModule]);

    app = await init(module);
  });

  beforeEach(async () => {
    jest.resetAllMocks();
    await clearSchema();
  });

  afterAll(async () => {
    await app.close();
  });

  const getRoute = () => `/api/v1/tickets`;

  describe('POST /tickets', () => {
    const invalidEntities = [
      undefined,
      {},
      { message: faker.random.words() },
      { type: getRandomTicketType() },
      { message: null, type: getRandomTicketType() },
      { message: faker.random.words(), type: faker.random.word() },
    ];

    it.each(invalidEntities)('422', async (invalidEntity) => {
      const res = await makeRequest(app).post(getRoute()).send(invalidEntity);

      expect(res.status).toBe(HttpStatus.UNPROCESSABLE_ENTITY);
    });

    it('201 - ticket created', async () => {
      const given = createRandomTicket();

      const res = await makeRequest(app).post(getRoute()).send(given);

      const savedTicket = await testDataSource.getRepository(Ticket).findOne({
        where: {},
      });

      expect(res.status).toBe(HttpStatus.CREATED);
      expect(savedTicket).toMatchObject({
        message: given.message,
        type: given.type,
      });
    });

    it('201 - ticket created (with author data)', async () => {
      const given = createRandomTicket({
        authorEmail: faker.internet.email(),
        authorName: faker.random.word(),
      });

      const res = await makeRequest(app).post(getRoute()).send(given);

      const savedTicket = await testDataSource.getRepository(Ticket).findOne({
        where: {},
      });

      expect(res.status).toBe(HttpStatus.CREATED);
      expect(savedTicket).toMatchObject({
        authorName: given.authorName,
        authorEmail: given.authorEmail,
      });
    });
  });
});
