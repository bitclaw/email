import { afterEach, beforeEach, describe, expect, it } from "bun:test";
import { SmtpProvider } from "./smtp";

const MAILPIT_API = "http://localhost:8025/api/v1";

type MailpitMessage = {
  ID: string;
  From: { Address: string; Name: string };
  To: Array<{ Address: string; Name: string }>;
  Subject: string;
  ReplyTo?: Array<{ Address: string; Name: string }>;
};

type MailpitMessages = {
  messages: MailpitMessage[];
  total: number;
};

async function getMessages(): Promise<MailpitMessage[]> {
  const res = await fetch(`${MAILPIT_API}/messages`);
  const data = (await res.json()) as MailpitMessages;
  return data.messages ?? [];
}

async function deleteAllMessages(): Promise<void> {
  await fetch(`${MAILPIT_API}/messages`, { method: "DELETE" });
}

async function getMessage(id: string): Promise<MailpitMessage> {
  const res = await fetch(`${MAILPIT_API}/message/${id}`);
  return (await res.json()) as MailpitMessage;
}

const mailpitConfig = {
  provider: "smtp" as const,
  from: "Dev <dev@localhost>",
  smtp: { host: "localhost", port: 1025, secure: false },
};

describe("SmtpProvider", () => {
  beforeEach(async () => {
    await deleteAllMessages();
  });

  afterEach(async () => {
    await deleteAllMessages();
  });

  it("should return provider name", () => {
    const provider = new SmtpProvider(mailpitConfig);
    expect(provider.getProviderName()).toBe("smtp");
  });

  it("should fail when SMTP config is missing", async () => {
    const provider = new SmtpProvider({
      provider: "smtp",
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

  it("should send email and deliver to Mailpit", async () => {
    const provider = new SmtpProvider(mailpitConfig);

    const result = await provider.send({
      to: "user@example.com",
      subject: "Integration test",
      html: "<p>Hello from test</p>",
    });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.provider).toBe("smtp");
      expect(result.data.id).toBeTruthy();
    }

    const messages = await getMessages();
    expect(messages.length).toBe(1);
    expect(messages[0]!.Subject).toBe("Integration test");
    expect(messages[0]!.To[0]!.Address).toBe("user@example.com");
    expect(messages[0]!.From.Address).toBe("dev@localhost");
  });

  it("should join array recipients and deliver to all", async () => {
    const provider = new SmtpProvider(mailpitConfig);

    const result = await provider.send({
      to: ["a@example.com", "b@example.com"],
      subject: "Multi-recipient test",
      html: "<p>Hi everyone</p>",
    });

    expect(result.ok).toBe(true);

    const messages = await getMessages();
    expect(messages.length).toBe(1);
    const toAddresses = messages[0]!.To.map((t) => t.Address);
    expect(toAddresses).toContain("a@example.com");
    expect(toAddresses).toContain("b@example.com");
  });

  it("should set Reply-To header when replyTo provided", async () => {
    const provider = new SmtpProvider(mailpitConfig);

    await provider.send({
      to: "user@example.com",
      subject: "Reply-To test",
      html: "<p>Hi</p>",
      replyTo: "support@example.com",
    });

    const messages = await getMessages();
    const msg = await getMessage(messages[0]!.ID);
    expect(msg.ReplyTo?.[0]?.Address).toBe("support@example.com");
  });

  it("should use from override when provided", async () => {
    const provider = new SmtpProvider(mailpitConfig);

    await provider.send({
      to: "user@example.com",
      subject: "From override test",
      html: "<p>Hi</p>",
      from: "override@example.com",
    });

    const messages = await getMessages();
    expect(messages[0]!.From.Address).toBe("override@example.com");
  });

  it("should handle connection refused with EMAIL_CONNECTION_FAILED", async () => {
    const provider = new SmtpProvider({
      provider: "smtp",
      from: "test@example.com",
      smtp: { host: "localhost", port: 9999, secure: false },
    });

    const result = await provider.send({
      to: "user@example.com",
      subject: "Hello",
      html: "<p>Hi</p>",
    });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.code).toBe("EMAIL_CONNECTION_FAILED");
    }
  });
});
