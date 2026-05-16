# @bitclaw/email

Multi-provider email abstraction layer with React email rendering support.

## Features

- **Multi-provider** — Resend and SMTP (nodemailer) out of the box
- **React email** — Render React components to HTML via `@react-email/render`
- **Result type** — Type-safe `Result<T>` pattern for error handling
- **Config from env** — Auto-configure from environment variables
- **Mailpit support** — Local dev with Mailpit SMTP (no API keys needed)

## Installation

```bash
bun add @bitclaw/email
```

Resend is an optional peer dependency — only install it if you use the Resend provider:

```bash
bun add resend
```

## Quick Start

```typescript
import { createEmailProvider, createEmailConfigFromEnv } from '@bitclaw/email'

// Auto-configure from environment variables
const config = createEmailConfigFromEnv()
const provider = await createEmailProvider({ config })

// Send a plain-text email
const result = await provider.send({
  to: 'user@example.com',
  subject: 'Welcome!',
  text: 'Thanks for signing up.',
})

if (result.success) {
  console.log('Sent:', result.data)
} else {
  console.error('Failed:', result.error)
}
```

### With React Email Templates

```typescript
import { createEmailProvider, renderReactEmail } from '@bitclaw/email'

const html = await renderReactEmail(<WelcomeEmail name="Alice" />)

await provider.send({
  to: 'alice@example.com',
  subject: 'Welcome to RunMist',
  html,
})
```

## Providers

### Resend

```typescript
const config = {
  provider: 'resend',
  from: 'noreply@runmist.com',
  resend: { apiKey: process.env.RESEND_API_KEY },
}
```

### SMTP

```typescript
const config = {
  provider: 'smtp',
  from: 'noreply@runmist.com',
  smtp: {
    host: 'smtp.example.com',
    port: 587,
    secure: true,
    auth: { user: 'user', pass: 'password' },
  },
}
```

### Mailpit (Local Development)

```typescript
import { createMailpitConfig } from '@bitclaw/email'

// Connects to localhost:1025 with no auth
const config = createMailpitConfig()
```

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `EMAIL_PROVIDER` | `resend` | Provider: `resend` or `smtp` |
| `EMAIL_FROM` | `noreply@{APP_DOMAIN}` | From address |
| `RESEND_API_KEY` | — | Resend API key (if provider is resend) |
| `SMTP_HOST` | `localhost` | SMTP server host |
| `SMTP_PORT` | `587` | SMTP server port |
| `SMTP_SECURE` | `false` | Use TLS |
| `SMTP_USER` | — | SMTP username |
| `SMTP_PASS` | — | SMTP password |

## Exports

```typescript
// Provider factory
createEmailProvider(options)

// Provider classes
ResendProvider
SmtpProvider
BaseEmailProvider

// Config helpers
createEmailConfigFromEnv()
createMailpitConfig()

// React rendering
renderReactEmail(component)

// Result utilities
success(data)
failure(error)
isSuccess(result)
isFailure(result)

// Error codes
EMAIL_ERROR_CODES
```

## Testing

```bash
cd packages/email
bun test
```
