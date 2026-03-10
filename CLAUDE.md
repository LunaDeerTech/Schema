# CLAUDE.md

> **Canonical instructions live in `.github/copilot-instructions.md`.**
> This file mirrors that content so Claude Code also picks it up.

Schema is a personal knowledge management system (NestJS 10 + Vue 3 + SQLite + Tiptap).

## Quick Commands

```bash
# Backend (root)
pnpm dev            # hot-reload dev server
pnpm build          # compile to dist/
pnpm lint           # ESLint

# Frontend (client/)
cd client
pnpm dev            # Vite on :5173 → proxies to :3003
pnpm build          # TypeScript check + production build
pnpm lint           # ESLint on .ts/.vue

# Database reset
# Delete dev.db, dev.db-shm, dev.db-wal and restart
```

## Key Facts

- **No test framework** — verify manually
- **DB**: SQLite `dev.db`, auto-init on startup (tables + migrations)
- **Auth**: JWT in localStorage (`schema_token`), `@UseGuards(JwtAuthGuard)` on controllers
- **API prefix**: `/api/v1`, responses wrapped `{ code: 0, data }`
- **Database methods**: `queryOne`, `query`, `run`, `transaction`
- **Migrations**: `src/database/migrator.ts` — transaction-wrapped, idempotent

See `.github/copilot-instructions.md` for the full reference.
