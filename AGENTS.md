# AGENTS.md

Instructions for AI coding agents (Cursor, Antigravity, Codex, Claude Code, etc.).

**The full project guide is in [CLAUDE.md](CLAUDE.md). Read it first.** It is the single source of truth for architecture, commands, conventions and gotchas. Keep all guidance there; do not duplicate it here.

## Minimum you need if you can't open it

This is a Google Apps Script web portal: React + shadcn/ui + Tailwind frontend (`src/frontend/`), Apps Script backend (`src/backend/`), Google Sheets as the database. Built with Vite, deployed with clasp.

Before finishing any change, run:

```bash
npm run typecheck && npm run lint && npm run test:unittest && npm run build
```

Rules that are easy to miss:

- Every server function must be exposed on `global` in `src/backend/main.ts`, and mocked in `src/frontend/utils/serverFunctions.ts` for `npm run dev`.
- Frontend may only `import type` from the backend.
- Output must inline into a single HTML file: no separate assets, no router (pages are React state).
- Package manager is npm. TypeScript stays pinned to 6.0.x.
- Never commit `.clasp.json`. Deploying needs a Google login; don't attempt it in a sandbox.
