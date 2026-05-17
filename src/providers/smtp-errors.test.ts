// Tests for SMTP error code mapping that require mocking nodemailer.
// Kept in a separate file so the file-level mock does not bleed into
// the Mailpit integration tests in smtp.test.ts.
//
// EAUTH/ESOCKET require an auth-enforcing SMTP server — Mailpit is permissive.
// nodemailer v8 renamed 'NoAuth' → 'ENOAUTH'; we intentionally let it fall
// through to EMAIL_SEND_FAILED rather than adding a special case.

import { describe, expect, it, mock } from 'bun:test';

const mockSendMail = mock(() => Promise.resolve({ messageId: '<test@smtp>' }));

mock.module('nodemailer', () => ({
  createTransport: () => ({ sendMail: mockSendMail })
}));

import { SmtpProvider } from './smtp';

const smtpConfig = {
  provider: 'smtp' as const,
  from: 'test@example.com',
  smtp: { host: 'localhost', port: 1025, secure: false }
};

describe('SmtpProvider error codes', () => {
  it('should map EAUTH to EMAIL_AUTH_FAILED', async () => {
    const authErr = Object.assign(new Error('Invalid credentials'), {
      code: 'EAUTH'
    });
    mockSendMail.mockRejectedValueOnce(authErr);

    const provider = new SmtpProvider({
      ...smtpConfig,
      smtp: { ...smtpConfig.smtp, auth: { user: 'u', pass: 'p' } }
    });

    const result = await provider.send({
      to: 'user@example.com',
      subject: 'Hello',
      html: '<p>Hi</p>'
    });

    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.code).toBe('EMAIL_AUTH_FAILED');
  });

  // nodemailer v8 renamed 'NoAuth' → 'ENOAUTH'. Not explicitly handled —
  // falls through to EMAIL_SEND_FAILED intentionally.
  it('should map ENOAUTH (nodemailer v8) to EMAIL_SEND_FAILED', async () => {
    const enoauthErr = Object.assign(new Error('No auth'), { code: 'ENOAUTH' });
    mockSendMail.mockRejectedValueOnce(enoauthErr);

    const provider = new SmtpProvider(smtpConfig);

    const result = await provider.send({
      to: 'user@example.com',
      subject: 'Hello',
      html: '<p>Hi</p>'
    });

    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.code).toBe('EMAIL_SEND_FAILED');
  });

  it('should map unknown errors to EMAIL_SEND_FAILED', async () => {
    mockSendMail.mockRejectedValueOnce(new Error('Something broke'));

    const provider = new SmtpProvider(smtpConfig);

    const result = await provider.send({
      to: 'user@example.com',
      subject: 'Hello',
      html: '<p>Hi</p>'
    });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.code).toBe('EMAIL_SEND_FAILED');
      expect(result.message).toContain('Something broke');
    }
  });
});
