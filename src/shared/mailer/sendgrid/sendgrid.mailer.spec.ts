import { AppConfig } from '../../services/app.config';
import { NotificationTypes } from '../../notification/notification.config';
import { SendgridMailer } from './sendgrid.mailer';
import * as faker from 'faker';
import { SendgridMail } from './sendgrid.mail';

describe('Sendgrid mailer unit tests', () => {
  let mailer: SendgridMailer;
  let sgMail: {
    send: (msg: SendgridMail) => Promise<any>;
    setApiKey: any;
  };
  const appConfig = ({
    mailing: {
      from: faker.internet.email(),
      sendgridApiKey: faker.datatype.string(),
      templates: new Map([
        [
          NotificationTypes.resetPasswordConfirmationLink,
          faker.datatype.string(),
        ],
      ]),
    },
  } as unknown) as AppConfig;

  beforeEach(() => {
    sgMail = {
      send: jest.fn(),
      setApiKey: jest.fn(),
    };
    mailer = new SendgridMailer(appConfig, sgMail);
  });

  it.each([NotificationTypes.resetPasswordConfirmationLink])(
    'Should build correct message',
    (type) => {
      const email = faker.internet.email();
      const data = {
        [faker.random.word()]: faker.random.word(),
      };

      mailer.sendMail({
        email,
        type,
        data,
      });

      expect(sgMail.setApiKey).toHaveBeenCalledWith(
        appConfig.mailing.sendgridApiKey,
      );
      expect(sgMail.send).toHaveBeenCalledWith({
        to: email,
        from: appConfig.mailing.from,
        templateId: appConfig.mailing.templates.get(type),
        dynamicTemplateData: data,
      });
    },
  );
});
