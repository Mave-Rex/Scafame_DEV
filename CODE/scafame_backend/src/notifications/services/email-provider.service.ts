import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailProviderService {
  private readonly logger = new Logger(EmailProviderService.name);

  async sendMail(input: {
    to: string;
    subject: string;
    text: string;
  }): Promise<void> {
    const host = process.env.MAIL_HOST;
    const port = Number(process.env.MAIL_PORT ?? 587);
    const user = process.env.MAIL_USER;
    const pass = process.env.MAIL_PASS;
    const from = process.env.MAIL_FROM ?? user;

    if (!host || !user || !pass || !from) {
      throw new Error('Configuracion SMTP incompleta (MAIL_HOST, MAIL_USER, MAIL_PASS, MAIL_FROM)');
    }

    const transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: {
        user,
        pass,
      },
    });

    await transporter.sendMail({
      from,
      to: input.to,
      subject: input.subject,
      text: input.text,
    });

    this.logger.log(`Correo enviado a ${input.to} con asunto: ${input.subject}`);
  }
}
