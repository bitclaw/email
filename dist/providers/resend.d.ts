import type { Result } from '../result';
import type { SendEmailOptions, SendEmailResult } from '../types';
import { BaseEmailProvider } from './base';
export declare class ResendProvider extends BaseEmailProvider {
    private client;
    private getClient;
    send(options: SendEmailOptions): Promise<Result<SendEmailResult>>;
    getProviderName(): string;
}
//# sourceMappingURL=resend.d.ts.map