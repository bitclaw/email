import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { createEmailConfigFromEnv, createMailpitConfig } from './config';

describe('createEmailConfigFromEnv', () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    // Clear email-related env vars
    delete process.env.EMAIL_PROVIDER;
    delete process.env.EMAIL_FROM;
    delete process.env.APP_DOMAIN;
    delete process.env.RESEND_API_KEY;
    delete process.env.SMTP_HOST;
    delete process.env.SMTP_PORT;
    delete process.env.SMTP_USER;
    delete process.env.SMTP_PASS;
    delete process.env.SMTP_SECURE;
  });

  afterEach(() => {
    // Restore
    for (const key of Object.keys(process.env)) {
      if (!(key in originalEnv)) delete process.env[key];
    }
    Object.assign(process.env, originalEnv);
  });

  it('should default to resend provider', () => {
    const config = createEmailConfigFromEnv();
    expect(config.provider).toBe('resend');
  });

  it('should use EMAIL_PROVIDER env var', () => {
    process.env.EMAIL_PROVIDER = 'smtp';
    const config = createEmailConfigFromEnv();
    expect(config.provider).toBe('smtp');
  });

  it('should use EMAIL_FROM env var', () => {
    process.env.EMAIL_FROM = 'Custom <custom@example.com>';
    const config = createEmailConfigFromEnv();
    expect(config.from).toBe('Custom <custom@example.com>');
  });

  it('should include resend config when provider is resend', () => {
    process.env.RESEND_API_KEY = 'test-api-key';
    const config = createEmailConfigFromEnv();
    expect(config.resend?.apiKey).toBe('test-api-key');
  });

  it('should include smtp config when provider is smtp', () => {
    process.env.EMAIL_PROVIDER = 'smtp';
    process.env.SMTP_HOST = 'smtp.example.com';
    process.env.SMTP_PORT = '465';
    process.env.SMTP_SECURE = 'true';
    process.env.SMTP_USER = 'user';
    process.env.SMTP_PASS = 'pass';

    const config = createEmailConfigFromEnv();
    expect(config.smtp?.host).toBe('smtp.example.com');
    expect(config.smtp?.port).toBe(465);
    expect(config.smtp?.secure).toBe(true);
    expect(config.smtp?.auth?.user).toBe('user');
    expect(config.smtp?.auth?.pass).toBe('pass');
  });

  it('should omit auth when no SMTP_USER/SMTP_PASS', () => {
    process.env.EMAIL_PROVIDER = 'smtp';
    process.env.SMTP_HOST = 'localhost';
    process.env.SMTP_PORT = '1025';

    const config = createEmailConfigFromEnv();
    expect(config.smtp?.auth).toBeUndefined();
  });
});

describe('createMailpitConfig', () => {
  it('should return smtp provider', () => {
    const config = createMailpitConfig();
    expect(config.provider).toBe('smtp');
  });

  it('should use localhost:1025', () => {
    const config = createMailpitConfig();
    expect(config.smtp?.host).toBe('localhost');
    expect(config.smtp?.port).toBe(1025);
  });

  it('should not use secure connection', () => {
    const config = createMailpitConfig();
    expect(config.smtp?.secure).toBe(false);
  });

  it('should not require auth', () => {
    const config = createMailpitConfig();
    expect(config.smtp?.auth).toBeUndefined();
  });

  it('should have dev from address', () => {
    const config = createMailpitConfig();
    expect(config.from).toContain('localhost');
  });
});
