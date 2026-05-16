import type { EmailConfig } from './types';

export const createEmailConfigFromEnv = (): EmailConfig => {
  const raw = process.env.EMAIL_PROVIDER || 'resend';
  if (raw !== 'resend' && raw !== 'smtp') {
    throw new Error(
      `Invalid EMAIL_PROVIDER "${raw}". Must be "resend" or "smtp".`
    );
  }
  const provider: EmailConfig['provider'] = raw;
  const from =
    process.env.EMAIL_FROM ||
    `noreply@${process.env.APP_DOMAIN || 'localhost'}`;

  const config: EmailConfig = { provider, from };

  if (provider === 'resend') {
    config.resend = {
      apiKey: process.env.RESEND_API_KEY || ''
    };
  }

  if (provider === 'smtp') {
    config.smtp = {
      host: process.env.SMTP_HOST || 'localhost',
      port: parseInt(process.env.SMTP_PORT || '587', 10),
      secure: process.env.SMTP_SECURE === 'true',
      ...(process.env.SMTP_USER && process.env.SMTP_PASS
        ? { auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } }
        : {})
    };
  }

  return config;
};

export const createMailpitConfig = (): EmailConfig => {
  return {
    provider: 'smtp',
    from: 'Dev <dev@localhost>',
    smtp: {
      host: 'localhost',
      port: 1025,
      secure: false
    }
  };
};
