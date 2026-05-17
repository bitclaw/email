import { beforeEach, describe, expect, it, mock } from "bun:test";

const mockSend = mock((..._args: unknown[]) =>
  Promise.resolve({
    data: { id: "msg-123" } as { id: string } | null,
    error: null as { message: string } | null,
  }),
);

mock.module("resend", () => ({
  Resend: class MockResend {
    emails = { send: mockSend };
  },
}));

import { ResendProvider } from "./resend";

describe("ResendProvider", () => {
  beforeEach(() => {
    mockSend.mockClear();
  });

  it("should return provider name", () => {
    const provider = new ResendProvider({
      provider: "resend",
      from: "test@example.com",
      resend: { apiKey: "test-key" },
    });
    expect(provider.getProviderName()).toBe("resend");
  });

  it("should send email successfully", async () => {
    const provider = new ResendProvider({
      provider: "resend",
      from: "Test <test@example.com>",
      resend: { apiKey: "test-key" },
    });

    const result = await provider.send({
      to: "user@example.com",
      subject: "Hello",
      html: "<p>Hi</p>",
    });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.id).toBe("msg-123");
      expect(result.data.provider).toBe("resend");
    }

    expect(mockSend).toHaveBeenCalledTimes(1);
  });

  it("should fail when API key is missing", async () => {
    const provider = new ResendProvider({
      provider: "resend",
      from: "test@example.com",
    });

    const result = await provider.send({
      to: "user@example.com",
      subject: "Hello",
      html: "<p>Hi</p>",
    });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.code).toBe("EMAIL_PROVIDER_NOT_CONFIGURED");
    }
  });

  it("should handle Resend API errors", async () => {
    mockSend.mockResolvedValueOnce({
      data: null,
      error: { message: "Rate limit exceeded" },
    });

    const provider = new ResendProvider({
      provider: "resend",
      from: "test@example.com",
      resend: { apiKey: "test-key" },
    });

    const result = await provider.send({
      to: "user@example.com",
      subject: "Hello",
      html: "<p>Hi</p>",
    });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.code).toBe("EMAIL_SEND_FAILED");
    }
  });

  it("should handle send exceptions", async () => {
    mockSend.mockRejectedValueOnce(new Error("Network error"));

    const provider = new ResendProvider({
      provider: "resend",
      from: "test@example.com",
      resend: { apiKey: "test-key" },
    });

    const result = await provider.send({
      to: "user@example.com",
      subject: "Hello",
      html: "<p>Hi</p>",
    });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.code).toBe("EMAIL_SEND_FAILED");
      expect(result.message).toContain("Network error");
    }
  });

  it("should use from config as default", async () => {
    const provider = new ResendProvider({
      provider: "resend",
      from: "Default <default@example.com>",
      resend: { apiKey: "test-key" },
    });

    await provider.send({
      to: "user@example.com",
      subject: "Hello",
      html: "<p>Hi</p>",
    });

    const callArgs = mockSend.mock.calls[0]![0] as Record<string, unknown>;
    expect(callArgs.from).toBe("Default <default@example.com>");
  });

  it("should allow from override", async () => {
    const provider = new ResendProvider({
      provider: "resend",
      from: "Default <default@example.com>",
      resend: { apiKey: "test-key" },
    });

    await provider.send({
      to: "user@example.com",
      subject: "Hello",
      html: "<p>Hi</p>",
      from: "Override <override@example.com>",
    });

    const callArgs = mockSend.mock.calls[0]![0] as Record<string, unknown>;
    expect(callArgs.from).toBe("Override <override@example.com>");
  });
});
