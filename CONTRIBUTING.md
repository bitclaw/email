# Contributing

## Prerequisites

- [Bun](https://bun.sh) >= 1.3
- [Docker](https://docker.com) (for SMTP integration tests)

## Setup

```bash
bun install
```

## Running Tests

SMTP tests hit a real [Mailpit](https://github.com/axllent/mailpit) instance. Start it first:

```bash
docker compose up -d
```

Then run tests:

```bash
bun test
```

Mailpit web UI at http://localhost:8025 - inspect sent emails visually.

To reset the mailbox:

```bash
docker compose down -v && docker compose up -d
```

## Commands

| Command | Description |
|---|---|
| `bun run build` | Compile TypeScript to `dist/` |
| `bun run lint` | Biome lint check |
| `bun run lint:fix` | Biome lint + auto-fix |
| `bun run format` | Biome format |
| `bun run typecheck` | TypeScript type check (no emit) |
| `bun run knip` | Find unused exports and dependencies |
| `bun test` | Run all tests (requires Mailpit) |
| `bun test --watch` | Watch mode |
