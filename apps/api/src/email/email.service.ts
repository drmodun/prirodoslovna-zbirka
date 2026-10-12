import { Injectable, Logger } from '@nestjs/common';
import * as sgMail from '@sendgrid/mail';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private readonly enabled = !!process.env.SENDGRID_API_KEY;

  constructor() {
    if (this.enabled) sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    else this.logger.warn('SENDGRID_API_KEY is not set, emails are logged');
  }

  async sendMail(to: string, subject: string, text: string) {
    if (!this.enabled) {
      this.logger.log(`Email to ${to}: ${subject}\n${text}`);
      return;
    }

    const msg = {
      to,
      from: 'biosfera.trema@gmail.com',
      subject,
      text,
    };

    const response = await sgMail.send(msg);
    return response;
  }
}
