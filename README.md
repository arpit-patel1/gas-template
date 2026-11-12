# GAS React Template

Google Apps Script **web app** with a React + TypeScript + Tailwind frontend, built with Vite and deployed with clasp.

Merged from three MIT-licensed templates (see [NOTICE.md](NOTICE.md)):

| Source | What it contributes |
| --- | --- |
| [Mikoshiba-Kyu/gas-webapp-boilerplate](https://github.com/Mikoshiba-Kyu/gas-webapp-boilerplate) | Project base: React + TS + Vite, split frontend/backend builds, Vitest, Playwright, Husky, DevContainer |
| [enuchi/React-Google-Apps-Script](https://github.com/enuchi/React-Google-Apps-Script) | Tailwind sheet-editor React components, `gas-client` pattern, sheets server code |
| [labnol/apps-script-starter](https://github.com/labnol/apps-script-starter) | `doGet` / manifest conventions, OAuth scopes reference (`docs/scopes.md`) |

## Layout

```
src/frontend/   React app (components/, utils/serverFunctions.ts)
src/backend/    Apps Script server code (main.ts exposes functions on `global`)
gas/            appsscript.json + build output (gas/dist/index.html, main.js)
e2e/            Playwright tests
docs/scopes.md  OAuth scope reference
```

## Quick start

```bash
npm install
npm run dev            # local UI with a mocked server (no Google account needed)

npm run login          # clasp login
npx clasp create --type sheets --title "My App" --rootDir gas   # bound script; writes .clasp.json
npm run deploy         # build + clasp push
```

Then in the Apps Script editor: **Deploy > New deployment > Web app**.

`.clasp.json.example` shows the expected shape. `.clasp.json` is gitignored.

## Adding a server function

1. Write it in `src/backend/serverFunctions/`.
2. Export it from `serverFunctions/index.ts`.
3. Expose it in `src/backend/main.ts`: `global.myFn = myFn`.
4. Call it from React: `serverFunctions.myFn(...)` (add a mock in `utils/serverFunctions.ts` for `npm run dev`).

## Scripts

| Script | Purpose |
| --- | --- |
| `npm run dev` | Vite dev server, mocked backend |
| `npm run build` | Build frontend (single inlined HTML) + backend into `gas/dist` |
| `npm run deploy` | Build, then `clasp push` |
| `npm run typecheck` / `lint` | Type check / ESLint |
| `npm run test:unittest` | Vitest (mock Apps Script services with `vi.stubGlobal`) |
| `npm run test:e2e` | Playwright against a deployed URL (`PLAYWRIGHT_BASE_URL`) |

## Notes

- Sheet functions use `SpreadsheetApp.getActive()`, which needs a **spreadsheet-bound** script. For a standalone script, switch to `SpreadsheetApp.openById(...)`.
- The default manifest uses `executeAs: USER_ACCESSING`, `access: MYSELF`. Change in `gas/appsscript.json` before sharing.
- `.npmrc` sets `legacy-peer-deps` because `rollup-plugin-google-apps-script` declares an old Vite peer range.
- Apps Script can't use `BrowserRouter`; use state or `HashRouter`.
