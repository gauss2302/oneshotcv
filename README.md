# Resume Constructor

A production-ready resume builder split into two independently deployable applications:

- `frontend/` — Next.js client.
- `backend/` — Fastify API, Better Auth, database access, migrations, subscriptions, and photo processing.

Nginx is the public entry point in production. It serves the frontend at `/` and proxies `/api/*` to the backend.

## Repository structure

```text
backend/              Fastify server, Drizzle schema, migrations, backend Dockerfile
frontend/             Next.js app, UI, local API contracts, frontend Dockerfile, nginx config
docker-compose.yml    Production app stack: nginx, frontend, backend
.env.example          Production environment template
```

Root-level database and migration folders have been removed. The backend now owns the Drizzle schema and migrations.

## Development

Install and run each app from its own directory.

### Backend

```bash
cd backend
npm ci
npm run dev
```

Useful backend commands:

```bash
npm run typecheck
npm test
npm run build
npm run db:generate
npm run db:migrate
npm run db:check
```

The backend listens on `PORT` (default `4000`) and exposes `GET /api/health`.

### Frontend

```bash
cd frontend
npm ci
npm run dev
```

Useful frontend commands:

```bash
npm run typecheck
npm run lint
npm run build
```

The frontend uses `NEXT_PUBLIC_BACKEND_URL` for API and Better Auth calls. In production this should usually be the same public origin as the frontend because nginx proxies `/api/*`.

## Production deployment

### Prerequisites

- Docker and Docker Compose.
- A production PostgreSQL database reachable through `DATABASE_URL`.
- A production MinIO or S3-compatible object storage endpoint.
- A strong `BETTER_AUTH_SECRET` with at least 32 characters.
- Optional OAuth and Polar credentials.

### Configure environment

```bash
cp .env.example .env
```

Edit `.env` and set concrete production values. Important variables:

- `PUBLIC_APP_URL` — public origin served by nginx, for example `https://resume.example.com`.
- `DATABASE_URL` — PostgreSQL connection string.
- `BETTER_AUTH_SECRET` — strong secret, minimum 32 characters.
- `FRONTEND_ORIGIN` and `AUTH_PUBLIC_URL` — normally the same as `PUBLIC_APP_URL`.
- `INDEPENDENT_BACKEND_URL` — internal backend origin, normally `http://backend:4000` in Compose.
- `NEXT_PUBLIC_APP_URL` and `NEXT_PUBLIC_BACKEND_URL` — normally the same as `PUBLIC_APP_URL`.
- `MINIO_ENDPOINT`, `MINIO_PORT`, `MINIO_USE_SSL`, `MINIO_ACCESS_KEY`, `MINIO_SECRET_KEY`, `MINIO_BUCKET_NAME`.
- `NEXT_PUBLIC_MINIO_PUBLIC_URL` — public object-storage URL for rendered photos.

### Build and start

```bash
docker compose build
docker compose up -d
```

The production compose stack contains only application services:

- `nginx` — public port `80`, routes traffic to frontend/backend.
- `frontend` — internal Next.js service on port `3000`.
- `backend` — internal Fastify service on port `4000`.

PostgreSQL, MinIO, and other infrastructure services are expected to be provisioned separately for production.

### Routing

Nginx routes:

- `/api/*` → `backend:4000`
- everything else → `frontend:3000`

This keeps browser API calls and Better Auth on the same public origin while preserving a separated server/client deployment internally.

### Migrations

Backend migrations live in `backend/migrations/`. The backend container runs migrations before starting the Fastify server:

```bash
node dist/infrastructure/db/migrate.js && node dist/server.js
```

You can also run migrations manually:

```bash
cd backend
npm run db:migrate
```

### Health checks

- Public/frontend check: `GET /`
- Backend deep check: `GET /api/health`

`/api/health` verifies database connectivity and checks object storage when MinIO is configured.

## Feature summary

- Multiple professional resume templates.
- Real-time resume editing and preview.
- Photo upload, crop, and library management.
- Email/password and OAuth authentication through Better Auth.
- Auto-save and PDF export.
- Subscription support through Polar.
- Structured backend separation for production deployments.

## Security notes

- Never commit `.env`.
- Use HTTPS in production; terminate TLS at your load balancer, platform, or an HTTPS-enabled nginx layer.
- Use strong database, object-storage, OAuth, and Better Auth credentials.
- Restrict network access to PostgreSQL and object storage.
- Back up PostgreSQL and object-storage data regularly.
