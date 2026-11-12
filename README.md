# GAS Portal Template

A Google Apps Script **web portal** with a React + shadcn/ui + Tailwind frontend and **Google Sheets as the database**. Hello World page, a Sheets-backed Notes CRUD page, dark mode. Built with Vite, deployed with clasp.

## Stack (all latest at time of writing)

React 19 · Vite 8 · Tailwind CSS 4 · shadcn/ui (new-york, neutral) · TypeScript 6 · ESLint 10 · Vitest 5 · Playwright · clasp 3 · gas-client

> TypeScript is pinned to 6.x because `typescript-eslint` does not support TS 7 yet.

## Quick start

```bash
npm install
npm run dev        # full UI with an in-memory mock backend, no Google account needed
```

Deploy:

```bash
npm run login                                                    # clasp login
npx clasp create --type sheets --title "GAS Portal" --rootDir gas  # script bound to a new Sheet
npm run deploy                                                   # build + clasp push
```

Then in the Apps Script editor: **Deploy > New deployment > Web app**. Open the URL, add a note, and check the new `Notes` tab in the Sheet.

Standalone script (not bound to a Sheet)? Set Script Property `SPREADSHEET_ID` to your spreadsheet's ID.

## Layout

```
src/frontend/
  components/ui/     shadcn components (button, card, input, badge, table, dialog)
  components/        app shell (header + sidebar), theme toggle
  pages/             home.tsx (Hello World), notes.tsx (Sheets CRUD)
  utils/serverFunctions.ts   typed gas-client wrapper + dev mock
src/backend/
  main.ts            doGet + functions exposed on `global`
  serverFunctions/   db.ts (Sheets "table" helper), notes.ts, hello.ts
gas/appsscript.json  manifest (scopes, web app access)
```

## How the Sheets backend works

`createTable<T>(tabName, columns)` in `db.ts` turns one tab into a table: row 1 is the header, each row is an object with a UUID `id`. You get `list`, `add`, `update`, `remove`. Writes are wrapped in a script lock. The tab is created on first use.

```ts
const tasks = createTable<Task>('Tasks', ['id', 'title', 'done'])
```

## Adding a feature

1. Add a table + functions in `src/backend/serverFunctions/` and export from `index.ts`.
2. Expose them in `src/backend/main.ts` (`global.myFn = myFn`).
3. Add a mock in `utils/serverFunctions.ts` so `npm run dev` keeps working.
4. Build a page in `src/frontend/pages/` and add it to `app-shell.tsx` and `App.tsx`.

Add more shadcn components with `npx shadcn@latest add <component>` (`components.json` is preconfigured).

## Scripts

| Script                                  | Purpose                                                   |
| --------------------------------------- | --------------------------------------------------------- |
| `npm run dev`                           | Vite dev server with mocked backend                       |
| `npm run build`                         | Single-file frontend + backend bundle into `gas/dist`     |
| `npm run deploy`                        | Build, then `clasp push`                                  |
| `npm run typecheck` / `lint` / `format` | TS check / ESLint / Prettier                              |
| `npm run test:unittest`                 | Vitest (Apps Script services are stubbed in tests)        |
| `npm run test:e2e`                      | Playwright against a deployed URL (`PLAYWRIGHT_BASE_URL`) |

## Notes

- Manifest defaults: `executeAs: USER_ACCESSING`, `access: MYSELF`. Change `gas/appsscript.json` before sharing. Scopes are `spreadsheets` and `userinfo.email`; see `docs/scopes.md` for others.
- No router: Apps Script can't serve deep URLs, so pages are React state.
- `overrides` in `package.json` lets `rollup-plugin-google-apps-script` (old Vite peer range) work with Vite 8.
- `npm audit` reports a moderate `uuid` advisory via `gas-client` (affects v3/v5/v6 with a caller-provided buffer) and issues in dev-only `@google/clasp` dependencies.

## Credits

Merged from MIT-licensed templates: see [NOTICE.md](NOTICE.md).
