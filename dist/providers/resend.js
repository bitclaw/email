import { EMAIL_ERROR_CODES } from '../errors';
import { err, ok } from '../result';
import { BaseEmailProvider } from './base';
export class ResendProvider extends BaseEmailProvider {
    client = null;
    async getClient() {
        if (this.client)
            return this.client;
        const apiKey = this.config.resend?.apiKey;
        if (!apiKey) {
            return null;
        }
        const { Resend } = await import('resend');
        this.client = new Resend(apiKey);
        return this.client;
    }
    async send(options) {
        const client = await this.getClient();
        if (!client) {
            return err(EMAIL_ERROR_CODES.PROVIDER_NOT_CONFIGURED, 'Resend API key is not configured');
        }
        const contentResult = await this.resolveContent(options);
        if (!contentResult.ok)
            return contentResult;
        const { html, text } = contentResult.data;
        const from = this.getFrom(options);
        try {
            const result = await client.emails.send({
                from,
                to: options.to,
                subject: options.subject,
                html,
                text,
                ...(options.replyTo ? { replyTo: options.replyTo } : {})
            });
            if (result.error) {
                return err(EMAIL_ERROR_CODES.SEND_FAILED, result.error.message || 'Resend API error');
            }
            return ok({
                id: result.data?.id || 'unknown',
                provider: this.getProviderName()
            });
        }
        catch (error) {
            return err(EMAIL_ERROR_CODES.SEND_FAILED, `Failed to send email via Resend: ${error instanceof Error ? error.message : String(error)}`, error instanceof Error ? error : undefined);
        }
    }
    getProviderName() {
        return 'resend';
    }
}
