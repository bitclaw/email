import { EMAIL_ERROR_CODES } from "../errors";
import { renderReactEmail } from "../render";
import type { Result } from "../result";
import { err, ok } from "../result";
import type {
  EmailConfig,
  EmailProvider,
  SendEmailOptions,
  SendEmailResult,
} from "../types";

export type ResolvedEmailContent = {
  html: string;
  text?: string;
};

export abstract class BaseEmailProvider implements EmailProvider {
  protected config: EmailConfig;

  constructor(config: EmailConfig) {
    this.config = config;
  }

  abstract send(options: SendEmailOptions): Promise<Result<SendEmailResult>>;
  abstract getProviderName(): string;

  protected async resolveContent(
    options: SendEmailOptions,
  ): Promise<Result<ResolvedEmailContent>> {
    if (options.react) {
      try {
        const { html, text } = await renderReactEmail(options.react);
        return ok({ html, text });
      } catch (error: unknown) {
        return err(
          EMAIL_ERROR_CODES.RENDER_FAILED,
          `Failed to render React email: ${error instanceof Error ? error.message : String(error)}`,
          error instanceof Error ? error : undefined,
        );
      }
    }

    return ok({ html: options.html!, text: options.text });
  }

  protected getFrom(options: SendEmailOptions): string {
    return options.from || this.config.from;
  }
}

export type CreateEmailProviderOptions = {
  config: EmailConfig;
};

export const createEmailProvider = async (
  options: CreateEmailProviderOptions,
): Promise<Result<EmailProvider>> => {
  const { config } = options;

  switch (config.provider) {
    case "resend": {
      const { ResendProvider } = await import("./resend");
      return ok(new ResendProvider(config));
    }
    case "smtp": {
      const { SmtpProvider } = await import("./smtp");
      return ok(new SmtpProvider(config));
    }
    default:
      return err(
        EMAIL_ERROR_CODES.INVALID_CONFIG,
        `Unknown email provider: ${config.provider}`,
      );
  }
};
