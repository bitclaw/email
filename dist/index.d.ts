export { createEmailConfigFromEnv, createMailpitConfig } from './config';
export { EMAIL_ERROR_CODES } from './errors';
export type { CreateEmailProviderOptions } from './providers/base';
export { BaseEmailProvider, createEmailProvider } from './providers/base';
export { ResendProvider } from './providers/resend';
export { SmtpProvider } from './providers/smtp';
export { renderReactEmail } from './render';
export type { Err, Ok, Result } from './result';
export { err, isErr, isOk, ok } from './result';
export type { EmailConfig, EmailProvider, EmailProviderType, SendEmailOptions, SendEmailResult } from './types';
//# sourceMappingURL=index.d.ts.map