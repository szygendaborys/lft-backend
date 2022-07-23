import { NotificationTypes } from './../../notification/notification.config';
import { Injectable } from '@nestjs/common';
import { inspect } from 'util';
import { AppConfig } from '../../services/app.config';
import { Mailer } from '../mailer';
import { SendgridMail } from './sendgrid.mail';
import { SendgridTemplateIdNotFoundException } from './sendgridTemplateIdNotFound.exception';

@Injectable()
export class SendgridMailer extends Mailer {
  constructor(
    private readonly appConfig: AppConfig,
    private readonly sgMail: {
      send: (msg: SendgridMail) => Promise<any>;
      setApiKey: any;
    },
  ) {
    super();

    this.sgMail.setApiKey(this.appConfig.mailing.sendgridApiKey);
  }

  async sendMail(opts: {
    email: string;
    type: NotificationTypes;
    data: Record<string, any>;
  }): Promise<void> {
    try {
      const message = this.buildMessage(opts);

      await this.sgMail.send(message);
    } catch (e) {
      console.log(inspect(e.response.body.errors));
      throw e;
    }
  }

  private buildMessage({
    email,
    type,
    data,
  }: {
    email: string;
    type: NotificationTypes;
    data: Record<string, any>;
  }) {
    const templateId = this.appConfig.mailing.templates.get(type);

    if (!templateId) {
      throw new SendgridTemplateIdNotFoundException();
    }

    return {
      to: email,
      from: this.appConfig.mailing.from,
      templateId,
      dynamicTemplateData: data,
    };
  }
}
