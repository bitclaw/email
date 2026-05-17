import { EMAIL_ERROR_CODES } from '../errors';
import { renderReactEmail } from '../render';
import { err, ok } from '../result';
export class BaseEmailProvider {
    config;
    constructor(config) {
        this.config = config;
    }
    async resolveContent(options) {
        if (options.react) {
            try {
                const { html, text } = await renderReactEmail(options.react);
                return ok({ html, text });
            }
            catch (error) {
                return err(EMAIL_ERROR_CODES.RENDER_FAILED, `Failed to render React email: ${error instanceof Error ? error.message : String(error)}`, error instanceof Error ? error : undefined);
            }
        }
        return ok({ html: options.html, text: options.text });
    }
    getFrom(options) {
        return options.from || this.config.from;
    }
}
export const createEmailProvider = async (options) => {
    const { config } = options;
    switch (config.provider) {
        case 'resend': {
            const { ResendProvider } = await import('./resend');
            return ok(new ResendProvider(config));
        }
        case 'smtp': {
            const { SmtpProvider } = await import('./smtp');
            return ok(new SmtpProvider(config));
        }
        default:
            return err(EMAIL_ERROR_CODES.INVALID_CONFIG, `Unknown email provider: ${config.provider}`);
    }
};
