# CLAUDE.md

Guidance for Claude Code (and humans) working in this repo.

## What this is

A template for a **Google Apps Script (GAS) web portal**: React + shadcn/ui + Tailwind frontend, Google Sheets as the database. Ships a Hello World page and a Sheets-backed Notes CRUD page. Built with Vite, deployed with clasp.

Merged from MIT templates (Mikoshiba-Kyu/gas-webapp-boilerplate, enuchi/React-Google-Apps-Script, labnol/apps-script-starter) plus shadcn/ui. See `NOTICE.md`. Keep that file accurate if you borrow more code.

## Commands

```bash
npm install
npm run dev            # Vite dev server, mocked backend (no Google account)
npm run typecheck      # tsc -b
npm run lint           # eslint, max-warnings 0
npm run test:unittest  # vitest run (backend only)
npm run build          # gas/dist/index.html (inlined) + gas/dist/main.js
npm run deploy         # build + clasp push
npm run test:e2e       # Playwright against a deployed URL (PLAYWRIGHT_BASE_URL)
npm run format         # prettier --write .
```

Before finishing any change, run: `npm run typecheck && npm run lint && npm run test:unittest && npm run build`.

Deploying needs a Google login (`npx clasp login`), which cannot be done in a sandbox. Never commit `.clasp.json` (gitignored; see `.clasp.json.example`).

## Architecture

```
src/frontend/          React app (runs in the browser, inside GAS's iframes)
  components/ui/       shadcn components (new-york style, neutral)
  components/          app-shell.tsx (header + sidebar), theme-toggle.tsx
  pages/               home.tsx, notes.tsx
  lib/utils.ts         cn() helper
  utils/serverFunctions.ts   typed gas-client wrapper + in-memory dev mock
  index.css            Tailwind v4 + shadcn theme variables (light/dark)
src/backend/           Apps Script server code (runs on Google)
  main.ts              doGet + functions exposed on `global`
  serverFunctions/     db.ts (Sheets table helper), notes.ts, hello.ts, index.ts
gas/appsscript.json    manifest (OAuth scopes, web app access)
gas/dist/              build output (gitignored)
e2e/                   Playwright tests
docs/scopes.md         OAuth scope reference
```

### Build pipeline

Two separate Vite builds write into `gas/dist/`, and `clasp push` uploads `gas/` (`rootDir: gas`):

- `vite.config.frontend.ts`: React + Tailwind + `vite-plugin-singlefile`. GAS can only serve one HTML file, so JS and CSS are inlined into `index.html`.
- `vite.config.backend.ts`: `rollup-plugin-google-apps-script` bundles `src/backend/main.ts` into `main.js` with top-level function stubs GAS needs to see.
- `vite.config.ts` is only for `npm run dev` and Vitest.

### Request flow

React page, then `serverFunctions.x()` (gas-client wraps `google.script.run`), then a function on `global` in `main.ts`, then the serverFunctions module, then `SpreadsheetApp`.

### Sheets as database (`db.ts`)

`createTable<T>(tabName, columns)` turns one tab into a table: row 1 is the header, rows are objects with a UUID `id`. Gives `list/add/update/remove`. Writes use `LockService`. The tab is auto-created on first use. Spreadsheet resolution: Script Property `SPREADSHEET_ID`, else the bound spreadsheet (`getActive()`).

Store timestamps as **epoch-ms numbers**, not date strings: Sheets auto-converts date-looking strings into Date cells.

## Adding a feature

1. Backend: add a table and functions in `src/backend/serverFunctions/`, export from `index.ts`.
2. Expose each function in `src/backend/main.ts`: `global.myFn = myFn`. **Forgetting this is the most common bug**: the client call fails at runtime and no type error warns you.
3. Add a mock for it in `src/frontend/utils/serverFunctions.ts` so `npm run dev` works. The `ServerFunctions` type forces the mock to match.
4. Frontend: add a page in `src/frontend/pages/`, register it in `app-shell.tsx` (`PageId` + `NAV`) and `App.tsx`.
5. Add a Vitest spec next to backend code. Stub GAS globals with `vi.stubGlobal` (see `db.spec.ts`).
6. New OAuth scope needed? Add it to `gas/appsscript.json` (see `docs/scopes.md`).

More shadcn components: `npx shadcn@latest add <name>` (`components.json` is preconfigured, alias `@` = `src/frontend`). The CLI may write to a literal `./@/` dir and import `cn` from a bogus `"cn"` package: move files into `src/frontend/components/ui/`, fix imports to `@/lib/utils`, `npm uninstall cn`. `sonner.tsx` reads theme from the `<html>` class (no next-themes).

## Conventions and gotchas

- **No router.** GAS cannot serve deep URLs; pages are React state. If routing is ever needed, use `HashRouter`.
- **No external assets.** Everything must inline into one HTML file. Don't add runtime `fetch` of local files, separate CSS/JS, or image imports that Vite won't inline.
- **Frontend imports backend types only** (`import type`). Never import backend runtime code into the frontend: it uses GAS globals that don't exist in the browser.
- **Server functions return plain JSON-serializable data.** `google.script.run` can't return `Date`, `undefined` in objects, or class instances. Use numbers/strings.
- **`localStorage` may throw** inside the GAS iframe; always wrap in try/catch (see `theme-toggle.tsx`).
- **React Hooks lint is strict** (`react-hooks/set-state-in-effect`). Don't call setState synchronously in an effect; set state inside promise callbacks (see `pages/home.tsx`, `notes.tsx`).
- **shadcn `components/ui/` is vendored source.** Edit freely; react-refresh lint is off there.
- Prettier: no semicolons, single quotes. Husky + lint-staged run ESLint/Prettier on commit.
- `executeAs: USER_ACCESSING` + `access: MYSELF` is the default manifest. Changing access affects who can open the portal and whose permissions the Sheets calls use.

## Dependency notes

- **TypeScript is pinned to 6.0.x** because `typescript-eslint` does not support TS 7 yet. Unpin when it does.
- `overrides` in `package.json` forces `rollup-plugin-google-apps-script` to accept the installed Vite (it declares an old peer range). Keep it unless that plugin is replaced.
- `npm audit` shows a moderate `uuid` advisory via `gas-client` and findings in dev-only `@google/clasp`; known and not exploitable here.
- Package manager is **npm** (not yarn).

## Testing notes

- Unit tests cover the backend only (`src/**/*.spec.ts`), using a fake in-memory sheet.
- The frontend has no unit tests; verify UI changes with `npm run dev` (the mock backend mirrors the real API).
- Playwright e2e runs against a _deployed_ web app (GAS renders the app inside `#sandboxFrame > #userHtmlFrame`), so it needs `PLAYWRIGHT_BASE_URL` and a publicly accessible deployment.
- The real Sheets calls have only been tested against fakes, not a live spreadsheet yet.
