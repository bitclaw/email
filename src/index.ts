// Provider factory

// Config helpers
export { createEmailConfigFromEnv, createMailpitConfig } from "./config";
// Error codes
export { EMAIL_ERROR_CODES } from "./errors";
export type { CreateEmailProviderOptions } from "./providers/base";
export { BaseEmailProvider, createEmailProvider } from "./providers/base";
// Provider classes
export { ResendProvider } from "./providers/resend";
export { SmtpProvider } from "./providers/smtp";
// Render
export { renderReactEmail } from "./render";
export type { Err, Ok, Result } from "./result";
// Result utilities
export { err, isErr, isOk, ok } from "./result";
// Types
export type {
  EmailConfig,
  EmailProvider,
  EmailProviderType,
  SendEmailOptions,
  SendEmailResult,
} from "./types";
