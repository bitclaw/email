import { beforeEach, describe, expect, it, mock } from 'bun:test';

const mockSendMail = mock((..._args: unknown[]) =>
  Promise.resolve({ messageId: '<abc@smtp.example.com>' })
);

mock.module('nodemailer', () => ({
  default: {
    createTransport: () => ({
      sendMail: mockSendMail
    })
  },
  createTransport: () => ({
    sendMail: mockSendMail
  })
}));

import { SmtpProvider } from './smtp';

describe('SmtpProvider', () => {
  beforeEach(() => {
    mockSendMail.mockClear();
  });

  it('should return provider name', () => {
    const provider = new SmtpProvider({
      provider: 'smtp',
      from: 'test@example.com',
      smtp: { host: 'localhost', port: 1025, secure: false }
    });
    expect(provider.getProviderName()).toBe('smtp');
  });

  it('should send email successfully', async () => {
    const provider = new SmtpProvider({
      provider: 'smtp',
      from: 'Test <test@example.com>',
      smtp: { host: 'localhost', port: 1025, secure: false }
    });

    const result = await provider.send({
      to: 'user@example.com',
      subject: 'Hello',
      html: '<p>Hi</p>'
    });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.id).toBe('<abc@smtp.example.com>');
      expect(result.data.provider).toBe('smtp');
    }

    expect(mockSendMail).toHaveBeenCalledTimes(1);
  });

  it('should fail when SMTP config is missing', async () => {
    const provider = new SmtpProvider({
      provider: 'smtp',
      from: 'test@example.com'
    });

    const result = await provider.send({
      to: 'user@example.com',
      subject: 'Hello',
      html: '<p>Hi</p>'
    });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.code).toBe('EMAIL_PROVIDER_NOT_CONFIGURED');
    }
  });

  it('should handle connection refused errors', async () => {
    const err = new Error('connect ECONNREFUSED') as Error & { code: string };
    err.code = 'ECONNREFUSED';
    mockSendMail.mockRejectedValueOnce(err);

    const provider = new SmtpProvider({
      provider: 'smtp',
      from: 'test@example.com',
      smtp: { host: 'localhost', port: 1025, secure: false }
    });

    const result = await provider.send({
      to: 'user@example.com',
      subject: 'Hello',
      html: '<p>Hi</p>'
    });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.code).toBe('EMAIL_CONNECTION_FAILED');
    }
  });

  it('should handle auth errors', async () => {
    const err = new Error('Invalid credentials') as Error & { code: string };
    err.code = 'EAUTH';
    mockSendMail.mockRejectedValueOnce(err);

    const provider = new SmtpProvider({
      provider: 'smtp',
      from: 'test@example.com',
      smtp: {
        host: 'smtp.example.com',
        port: 587,
        secure: false,
        auth: { user: 'u', pass: 'p' }
      }
    });

    const result = await provider.send({
      to: 'user@example.com',
      subject: 'Hello',
      html: '<p>Hi</p>'
    });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.code).toBe('EMAIL_AUTH_FAILED');
    }
  });

  it('should handle generic send errors', async () => {
    mockSendMail.mockRejectedValueOnce(new Error('Something broke'));

    const provider = new SmtpProvider({
      provider: 'smtp',
      from: 'test@example.com',
      smtp: { host: 'localhost', port: 1025, secure: false }
    });

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

  it('should join array recipients', async () => {
    const provider = new SmtpProvider({
      provider: 'smtp',
      from: 'test@example.com',
      smtp: { host: 'localhost', port: 1025, secure: false }
    });

    await provider.send({
      to: ['a@example.com', 'b@example.com'],
      subject: 'Hello',
      html: '<p>Hi</p>'
    });

    const callArgs = mockSendMail.mock.calls[0]![0] as Record<string, unknown>;
    expect(callArgs.to).toBe('a@example.com, b@example.com');
  });
});
