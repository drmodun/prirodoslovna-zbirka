import { Injectable } from '@nestjs/common';
import * as sgMail from '@sendgrid/mail';

@Injectable()
export class EmailService {
  constructor() {
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
  }

  async sendMail(to: string, subject: string, text: string) {
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
