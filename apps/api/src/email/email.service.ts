import { Injectable, Logger } from '@nestjs/common';
import * as sgMail from '@sendgrid/mail';
import { createTransport, Transporter } from 'nodemailer';

const DEFAULT_FROM = 'biosfera.trema@gmail.com';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private readonly from = process.env.MAIL_FROM || DEFAULT_FROM;
  // Any SMTP server: a self-hosted one or a provider's relay. Takes
  // precedence over the SendGrid API key.
  private readonly smtp?: Transporter = process.env.SMTP_URL
    ? createTransport(process.env.SMTP_URL)
    : undefined;
  private readonly sendGrid = !this.smtp && !!process.env.SENDGRID_API_KEY;

  constructor() {
    if (this.smtp) this.logger.log('Emails are sent over SMTP');
    else if (this.sendGrid) sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    else
      this.logger.warn(
        'Neither SMTP_URL nor SENDGRID_API_KEY is set, emails are logged',
      );
  }

  async sendMail(to: string, subject: string, text: string) {
    const msg = {
      to,
      from: this.from,
      subject,
      text,
    };

    if (this.smtp) return await this.smtp.sendMail(msg);
    if (this.sendGrid) return await sgMail.send(msg);

    this.logger.log(`Email to ${to}: ${subject}\n${text}`);
  }
}
