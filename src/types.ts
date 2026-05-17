import type { ReactElement } from "react";
import type { Result } from "./result";

export type EmailProviderType = "resend" | "smtp";

export type SendEmailOptions = {
  to: string | string[];
  subject: string;
  from?: string;
  replyTo?: string;
} & (
  | { html: string; text?: string; react?: never }
  | { react: ReactElement; html?: never; text?: never }
);

export type SendEmailResult = {
  id: string;
  provider: string;
};

export type EmailProvider = {
  send(options: SendEmailOptions): Promise<Result<SendEmailResult>>;
  getProviderName(): string;
};

export type EmailConfig = {
  provider: EmailProviderType;
  from: string;
  resend?: { apiKey: string };
  smtp?: {
    host: string;
    port: number;
    secure: boolean;
    auth?: { user: string; pass: string };
  };
};
