import { Logger } from '@nestjs/common';
import { UnprocessableHandlerInstanceException } from './exceptions/unprocessable-handler-instance.exception';
import { NotificationHandler } from './handlers/notification.handler';
import { NotificationRepository } from './notification.repository';
import { NotificationMedium } from './notification.medium';
import { createUser } from '../../../test/utils/user.utils';
import { NotificationTypes } from './notification.config';
import * as faker from 'faker';
describe('Notification medium unit tests', () => {
  let medium: NotificationMedium;

  const repositoryMock = ({
    saveNotification: jest.fn(),
  } as unknown) as NotificationRepository;

  const handlerMock = {
    handle: jest.fn(),
    getHandlerName: () => faker.random.word(),
  } as NotificationHandler;

  const config = new Map<NotificationTypes, NotificationHandler[]>([
    [NotificationTypes.resetPasswordConfirmationLink, [handlerMock]],
  ]);

  const loggerMock = {} as Logger;

  beforeEach(() => {
    jest.resetAllMocks();

    medium = new NotificationMedium(repositoryMock, config, loggerMock);
  });

  it('Should call a correct handler', async () => {
    await medium.sendNotification({
      user: createUser(),
      type: NotificationTypes.resetPasswordConfirmationLink,
      data: {},
    });

    expect(handlerMock.handle).toHaveBeenCalled();
  });

  it('Should throw an error', async () => {
    await expect(
      medium.sendNotification({
        user: createUser(),
        type: faker.random.word() as NotificationTypes,
        data: {},
      }),
    ).rejects.toThrow(UnprocessableHandlerInstanceException);
  });
});
