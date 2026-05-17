import { EMAIL_ERROR_CODES } from '../errors';
import type { Result } from '../result';
import { err, ok } from '../result';
import type { SendEmailOptions, SendEmailResult } from '../types';
import { BaseEmailProvider } from './base';

export class SmtpProvider extends BaseEmailProvider {
  private transporter: any = null;

  private async getTransporter() {
    if (this.transporter) return this.transporter;

    const smtp = this.config.smtp;
    if (!smtp) {
      return null;
    }

    const nodemailer = await import('nodemailer');
    this.transporter = nodemailer.createTransport({
      host: smtp.host,
      port: smtp.port,
      secure: smtp.secure,
      ...(smtp.auth ? { auth: smtp.auth } : {})
    });
    return this.transporter;
  }

  async send(options: SendEmailOptions): Promise<Result<SendEmailResult>> {
    const transporter = await this.getTransporter();
    if (!transporter) {
      return err(
        EMAIL_ERROR_CODES.PROVIDER_NOT_CONFIGURED,
        'SMTP configuration is missing'
      );
    }

    const contentResult = await this.resolveContent(options);
    if (!contentResult.ok) return contentResult;

    const { html, text } = contentResult.data;
    const from = this.getFrom(options);

    try {
      const info = await transporter.sendMail({
        from,
        to: Array.isArray(options.to) ? options.to.join(', ') : options.to,
        subject: options.subject,
        html,
        text,
        ...(options.replyTo ? { replyTo: options.replyTo } : {})
      });

      return ok({
        id: info.messageId || 'unknown',
        provider: this.getProviderName()
      });
    } catch (error: unknown) {
      const cause = error instanceof Error ? error : new Error(String(error));
      const code =
        'code' in cause ? (cause as NodeJS.ErrnoException).code : undefined;

      // nodemailer v8 wraps ECONNREFUSED as ESOCKET
      const isConnectionRefused =
        code === 'ECONNREFUSED' ||
        (code === 'ESOCKET' && cause.message.includes('ECONNREFUSED'));

      if (isConnectionRefused) {
        return err(
          EMAIL_ERROR_CODES.CONNECTION_FAILED,
          `SMTP connection refused at ${this.config.smtp?.host}:${this.config.smtp?.port}`,
          cause
        );
      }

      if (code === 'EAUTH' || code === 'ESOCKET') {
        return err(
          EMAIL_ERROR_CODES.AUTH_FAILED,
          `SMTP authentication failed: ${cause.message}`,
          cause
        );
      }

      return err(
        EMAIL_ERROR_CODES.SEND_FAILED,
        `Failed to send email via SMTP: ${cause.message}`,
        cause
      );
    }
  }

  getProviderName(): string {
    return 'smtp';
  }
}
