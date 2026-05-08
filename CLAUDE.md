# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository layout

Two independently deployable apps live under one repo. Each has its own `package.json`, `tsconfig.json`, `Dockerfile`, and `node_modules`. There is no root `package.json` and no monorepo tooling — always `cd` into `backend/` or `frontend/` before running scripts.

- `backend/` — Fastify API, Better Auth, Drizzle schema + migrations, MinIO/Polar integrations.
- `frontend/` — Next.js 16 (App Router) client, Zustand store, Tailwind v4.
- `frontend/nginx/nginx.conf` — production reverse proxy: `/api/*` → backend:4000, everything else → frontend:3000.
- `docker-compose.yml` — production stack only (nginx + frontend + backend). Postgres and MinIO are external.

## Commands

### Backend (`cd backend`)

```bash
npm run dev          # tsx watch src/server.ts (port 4000)
npm run typecheck    # tsc --noEmit
npm test             # vitest run, picks up src/**/*.test.ts
npm test -- src/modules/photos/file-validation.test.ts   # single file
npm test -- -t "rejects oversized"                        # by test name
npm run build        # tsup → dist/server.js + dist/infrastructure/db/migrate.js
npm run db:generate  # generate SQL from src/infrastructure/db/schema.ts
npm run db:migrate   # tsx src/infrastructure/db/migrate.ts (applies migrations/*.sql)
npm run db:check     # drizzle-kit check
```

The container start command is `node dist/infrastructure/db/migrate.js && node dist/server.js` — migrations run on every boot.

### Frontend (`cd frontend`)

```bash
npm run dev          # next dev (port 3000)
npm run typecheck    # tsc --noEmit
npm run lint         # eslint (eslint-config-next)
npm run build        # next build (output: "standalone")
```

There is no test runner configured for the frontend.

### Local stack (dev)

```bash
docker compose build && docker compose up -d
```

`docker-compose.override.yml` is auto-loaded and adds local Postgres (5432) and MinIO (9000 API + 9001 console) services. Backend env is overridden to point at `postgres:5432` and `minio:9000`. MinIO console: `http://localhost:9001` (login `minioadmin` / `minioadmin`). The `resume-photos` bucket is created lazily by the backend on first upload.

### Production stack

```bash
docker compose -f docker-compose.yml up -d
```

Skips the override. Postgres and MinIO are expected to be externally provisioned; configure `DATABASE_URL`, `MINIO_*`, and `NEXT_PUBLIC_MINIO_PUBLIC_URL` in `.env`.

Health checks: `GET /` (frontend) and `GET /api/health` (backend deep check — verifies DB and MinIO when configured).

## Architecture

### Browser → backend: single public origin, no Next API proxy

In production nginx routes `/api/*` to the Fastify backend on the same origin as the frontend. The browser calls Fastify directly via `NEXT_PUBLIC_BACKEND_URL` (`frontend/lib/api/client.ts`). There is no BFF layer — `frontend/app/api/*` does not exist on purpose. Better Auth cookies are first-party because both sides share the public origin.

`frontend/proxy.ts` is a Next middleware (Next 16 renamed `middleware` → `proxy`) that gates `/dashboard/*` and `/editor/*` on the presence of the `better-auth.session_token` cookie.

### Backend module shape

`backend/src/app.ts` composes plugins and feature modules. Each feature module under `src/modules/<name>/` follows the same layering:

- `routes.ts` — Fastify route handlers; pulls session via `getSessionFromRequest`, validates with Zod schemas, delegates to service.
- `service.ts` — business logic and transactions.
- `repository.ts` — Drizzle queries.
- `schemas.ts` — Zod request schemas.
- `mappers.ts` — DB row ↔ contract DTO conversion.

Cross-cutting infrastructure lives in `src/infrastructure/{db,storage,payments}/` and `src/plugins/` (cors, cookies, multipart, rate-limit). All env access goes through `getBackendEnv()` in `src/config/env.ts` — a Zod-validated, cached singleton. Do not read `process.env` directly elsewhere.

Path alias `@/*` → `src/*` (configured in both `tsconfig.json` and `vitest.config.ts`).

### Shared contracts (single source of truth)

`backend/src/contracts/` is the canonical Zod schema location. `frontend/contracts/` is a **symlink** to `../backend/src/contracts`. Edit only the backend copy — both sides see the change. Backend imports via `@/contracts/*`; frontend imports via `@contracts/*`.

Local dev relies on Node's module resolution walking up from `backend/src/contracts/` to find `backend/node_modules/zod` — which works because `backend/` has `zod` as a direct dep.

In Docker the symlink crosses outside the build context, so `frontend/Dockerfile` (build context: repo root, set in `docker-compose.yml`) replaces it with a real directory:

```
COPY frontend/ ./
RUN rm -rf /app/contracts
COPY backend/src/contracts /app/contracts
```

After this the bundler treats `contracts/` as an in-project module and resolves `zod` from `frontend/node_modules`. If you move or rename `backend/src/contracts/`, update the Dockerfile too.

### Errors and HTTP status mapping

Backend modules throw typed errors that extend `ApiError` (`backend/src/lib/api-error.ts`), each carrying its own `status`. Route handlers catch with `instanceof ApiError` and call `reply.code(error.status).send({ error: error.message })`. Per-module error classes live in `backend/src/modules/<name>/errors.ts`. Add new error types there rather than throwing `new Error("string")` and matching strings in the route.

### Data model

Drizzle schema in `backend/src/infrastructure/db/schema.ts` owns:

- Better Auth tables (`user`, `session`, `account`, `verification`) — schema must match Better Auth expectations; do not rename columns.
- Resume domain: `resumes` (1) → `education` / `experience` / `skills` (many), each with `sortOrder` for ordering.
- Photo library: `photos` (user-owned) joined to resumes via `resume_photos` (unique per resume).
- Polar billing: `polar_customers` (1:1 with user) and `polar_subscriptions`.

`resumes.userId` references `user.id` with `onDelete: "cascade"`, and so on down — deleting a user wipes their resumes, photos, and subscriptions. Saving a resume replaces collections inside a single transaction (`replaceResumeCollections` in `modules/resumes/service.ts`).

### Frontend state

- `frontend/store/useCVStore.ts` — Zustand store, single source of truth for the editor.
- `frontend/hooks/use-resume-sync.ts` — debounced auto-save against the backend.
- `frontend/lib/api/*.ts` — typed API clients built on `apiFetch` (`credentials: "include"` for Better Auth cookies).
- `frontend/components/templates/` — 16 resume templates, all consuming the same shape from `templates/types.ts`. Adding a template means a new component plus an entry in `frontend/lib/template-config.ts`.

### Auth

Better Auth runs on the backend (`src/modules/auth/auth.ts`), mounted at `/api/auth/*`. The frontend uses `better-auth/react` via `frontend/lib/auth/auth-client.ts` pointing at `NEXT_PUBLIC_BACKEND_URL`. `BETTER_AUTH_SECRET` must be ≥32 chars (enforced by Zod). OAuth (Google, GitHub, LinkedIn) and Polar are all optional — guarded by env presence.

## Conventions from `.cursor/rules/`

- **Styling:** Tailwind utilities only — avoid custom CSS files and inline style tags. Use the spacing scale (`p-4`, `gap-2`) over arbitrary values; use `rounded-lg` for buttons/inputs and `rounded-2xl` for cards. Brand gradient is `from-[#1B76FC] to-[#36C9F9]`.
- **Components:** UI primitives in `frontend/components/ui/` use `class-variance-authority` for variants, `cn()` for class merging, forward refs, and Radix's `asChild` where applicable. Match these patterns when adding to that directory.
- **Icons:** Lucide React, sizes 16/18/20/24, color via `text-*` (icons inherit).
- **Handlers:** name event handlers `handleClick`, `handleKeyDown`, etc. Prefer early returns.
- Full design-token reference: `.cursor/rules/design_system_rules.mdc`. CSS variables are defined in `frontend/app/globals.css` and mirrored in `frontend/lib/design-tokens.ts`.
