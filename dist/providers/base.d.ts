import type { Result } from '../result';
import type { EmailConfig, EmailProvider, SendEmailOptions, SendEmailResult } from '../types';
export type ResolvedEmailContent = {
    html: string;
    text?: string;
};
export declare abstract class BaseEmailProvider implements EmailProvider {
    protected config: EmailConfig;
    constructor(config: EmailConfig);
    abstract send(options: SendEmailOptions): Promise<Result<SendEmailResult>>;
    abstract getProviderName(): string;
    protected resolveContent(options: SendEmailOptions): Promise<Result<ResolvedEmailContent>>;
    protected getFrom(options: SendEmailOptions): string;
}
export type CreateEmailProviderOptions = {
    config: EmailConfig;
};
export declare const createEmailProvider: (options: CreateEmailProviderOptions) => Promise<Result<EmailProvider>>;
//# sourceMappingURL=base.d.ts.map