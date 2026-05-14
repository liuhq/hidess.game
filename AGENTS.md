# AGENTS.md

## Monorepo

Three pnpm workspace packages under the root:

| Package | Alias | Directory | Purpose |
|---|---|---|---|
| `@hidess/shared` | — | `shared/` | Pure game-logic types & rules |
| `@hidess/server` | — | `server/` | Hono API + WebSocket (port 5876) |
| `@hidess/web` | — | `web/` | Vite + React + TanStack Router (port 3000) |

`@hidess/shared` has **no build step**. It is imported by path alias in both `server` and `web` tsconfigs (`"@hidess/shared": ["../shared/src/index.ts"]`).

Each package uses `#/*` → `./src/*` for local imports.

## Commands

Run from repo root with **pnpm**:

```sh
pnpm serve:dev       # Start server (tsx watch, port 5876, reads server/.env)
pnpm serve:build     # Bundle server with esbuild → server/dist/
pnpm serve:start     # Run built server: node dist/index.js
pnpm web:dev         # Start web dev server (vite, port 3000)
pnpm web:build       # Build web for production

pnpm fmt             # Format all files with dprint
pnpm fmt:check       # Check formatting only
pnpm lint            # Lint both server and web (sequential)
pnpm lint:fix        # Lint with auto-fix
pnpm test            # Run all Vitest tests (root)
pnpm vitest run server/src/api/user/   # Run tests for a specific path
```

**Full-stack dev:** `pnpm serve:dev` and `pnpm web:dev` together. The Vite dev server proxies `/api` → `localhost:5876` and `/ws` → `ws://localhost:5876`.

## Generated files (never edit by hand)

- `web/src/routeTree.gen.ts` — TanStack Router file-based routing (excluded from dprint)
- `web/src/api/swr.gen.ts` + `web/src/api/model/` — Orval generates SWR hooks from the server's OpenAPI spec

To regenerate Orval output: `pnpm -F web orval` (requires server running at `OPENAPI_URL`, defaults to `http://localhost:5876/openapi.json`).

## Code style

- **Formatter:** dprint (`.dprint.json`). No semicolons, double quotes, 2-space indent, 80-char line width, LF endings.
- **Linter:** ESLint flat config. Base config at `config/eslint.base.mjs`. Web also uses `@tanstack/eslint-config` + `eslint-plugin-lingui`.
- **TypeScript:** strict mode, `noUnusedLocals`, `noUnusedParameters`, `noUncheckedIndexedAccess`, `allowImportingTsExtensions`. Root extends `@tsconfig/node-ts`, web extends `@tsconfig/vite-react`.

## Architecture notes

- **Server:** Hono framework with `hono-openapi`. Better Auth for auth (SQLite via `better-sqlite3`). WebSocket via `@hono/node-ws`. Dev mode uses `tsx watch --env-file=./.env` (NOT ts-node or tsx without env-file). Production build uses esbuild targeting Node 25.
- **Web:** React 19, TanStack Router, Tailwind CSS v4 (`@tailwindcss/vite`), TanStack Router devtools. i18n via Lingui (`en`, `zh`). Lingui commands: `pnpm -F web lingui:extract` and `pnpm -F web lingui:compile`.
- **CI:** ESLint workflow (`.github/workflows/eslint.yml`) only runs on `server/**` path changes.

## Environment

- `server/.env` — Server env vars (loaded automatically by `tsx --env-file`)
- `web/.env` — Web env vars (loaded automatically by Vite)
- `.env` and `.env.production` are gitignored

## Database

`server/src/db.ts` exports a singleton `better-sqlite3` Database. Import it with `import { db } from "#/db"`. Both Better Auth and any custom tables use this same connection. Do **not** create a second `new Database(...)` — use the singleton.

Custom tables follow the `user_profile` pattern: create with `CREATE TABLE IF NOT EXISTS` inside a store factory function that accepts a `Database` parameter.

## Testing conventions

Tests use **Vitest** with a root-level config (`vitest.config.ts`) that resolves `#` → `server/src` and `@hidess/shared`.

**Store modules** export a factory function that accepts a `Database` parameter:

```ts
export function createUserStore(db: Database) { ... }
```

Tests pass `new Database(":memory:")` for isolation.

**Route modules** export a factory that accepts the store:

```ts
export function createUserRoutes(store: ReturnType<typeof createUserStore>) { ... }
```

Tests create an in-memory-DB-backed store, pass it to the route factory, and use `app.request()` to exercise endpoints.

**Patch body schemas** must use `v.partial(v.pick(...))` — not bare `v.pick` — otherwise every PATCH body requires all picked fields.
