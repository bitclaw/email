import type { Result } from '../result';
import type { SendEmailOptions, SendEmailResult } from '../types';
import { BaseEmailProvider } from './base';
export declare class SmtpProvider extends BaseEmailProvider {
    private transporter;
    private getTransporter;
    send(options: SendEmailOptions): Promise<Result<SendEmailResult>>;
    getProviderName(): string;
}
//# sourceMappingURL=smtp.d.ts.map