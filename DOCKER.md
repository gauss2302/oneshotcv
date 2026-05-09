# Docker quick reference

Compose files live at the repo root. `docker-compose.override.yml` is **auto-merged** with `docker-compose.yml` for local dev (Postgres + MinIO). Use `-f docker-compose.yml` only when you want the **production** stack without the override.

Ensure `.env` exists at the repo root (see `.env.example`).

---

## Local full stack (nginx + frontend + backend + Postgres + MinIO)

```bash
# Build images and start in background
docker compose build && docker compose up -d
```

Default public URL in `.env.example` is `PUBLIC_APP_URL=http://localhost` with `HTTP_PORT=80` → app at **http://localhost** (no port).

---

## Rebuild (most common)

```bash
# Rebuild all services that have a build section, then recreate containers
docker compose build --pull && docker compose up -d

# Rebuild without cache (cleanest, slower)
docker compose build --no-cache && docker compose up -d

# Rebuild a single service, then recreate it
docker compose build backend && docker compose up -d backend
docker compose build frontend && docker compose up -d frontend

# Frontend uses repo root as build context; backend uses ./backend
docker compose build --no-cache frontend && docker compose up -d frontend
```

---

## Start / stop / logs

```bash
docker compose up -d              # start (create if needed)
docker compose down             # stop and remove containers (volumes kept)
docker compose down -v          # also remove named volumes (Postgres + MinIO data)
docker compose ps
docker compose logs -f          # all services
docker compose logs -f backend
docker compose logs -f nginx
```

---

## Production-style stack (no override)

Skips Postgres/MinIO from `docker-compose.override.yml`. Use when DB and object storage are external.

```bash
docker compose -f docker-compose.yml build && docker compose -f docker-compose.yml up -d
```

---

## Health checks (from host)

With default `HTTP_PORT=80`:

- App (via nginx): `http://localhost/`
- API: `http://localhost/api/health`

If you map a different `HTTP_PORT`, use `http://localhost:<HTTP_PORT>/` and `http://localhost:<HTTP_PORT>/api/health`.

---

## Local development URLs (bookmarks)

| What | URL |
|------|-----|
| App (nginx, default `.env`) | http://localhost |
| API health (through nginx) | http://localhost/api/health |
| MinIO S3 API | http://localhost:9000 |
| MinIO console | http://localhost:9001 (user/pass: `minioadmin` / `minioadmin`) |
| Postgres (host) | `localhost:5432` (from override; not HTTP) |

**`npm run dev` (no Docker)** — from `CLAUDE.md`:

- Frontend: http://localhost:3000
- Backend: http://localhost:4000
- Health: http://localhost:4000/api/health

---

## Google Cloud Console (OAuth) — local URLs

Better Auth uses `getAuthBaseUrl()` = `AUTH_PUBLIC_URL` if set, otherwise `FRONTEND_ORIGIN`.  
Redirect URIs registered in code:

- Google: `{authBaseUrl}/api/auth/callback/google`
- LinkedIn: `{authBaseUrl}/api/auth/callback/linkedin`
- GitHub: `{authBaseUrl}/api/auth/callback/github` (Better Auth default; same base URL)

**Pick the block that matches your `.env`.** Authorized redirect URIs must match **exactly** (scheme, host, port, path — no trailing slash on the path).

### A — Docker / nginx on port 80 (`PUBLIC_APP_URL=http://localhost`, `HTTP_PORT=80`)

**Authorized JavaScript origins**

```
http://localhost
```

**Authorized redirect URIs** (add each provider you use)

```
http://localhost/api/auth/callback/google
http://localhost/api/auth/callback/github
http://localhost/api/auth/callback/linkedin
```

### B — Docker / nginx on a custom port (e.g. `HTTP_PORT=8080`, `PUBLIC_APP_URL=http://localhost:8080`)

**Authorized JavaScript origins**

```
http://localhost:8080
```

**Authorized redirect URIs**

```
http://localhost:8080/api/auth/callback/google
http://localhost:8080/api/auth/callback/github
http://localhost:8080/api/auth/callback/linkedin
```

### C — `npm run dev` split stack (frontend :3000, backend :4000, auth base on backend)

Set `AUTH_PUBLIC_URL=http://localhost:4000` (and `FRONTEND_ORIGIN=http://localhost:3000`) so callbacks hit the API.

**Authorized JavaScript origins** (Google often needs the app origin; include both if unsure)

```
http://localhost:3000
http://localhost:4000
```

**Authorized redirect URIs**

```
http://localhost:4000/api/auth/callback/google
http://localhost:4000/api/auth/callback/github
http://localhost:4000/api/auth/callback/linkedin
```

### D — Same-origin on :3000 only (if `AUTH_PUBLIC_URL` / `FRONTEND_ORIGIN` are `http://localhost:3000`)

**Authorized JavaScript origins**

```
http://localhost:3000
```

**Authorized redirect URIs**

```
http://localhost:3000/api/auth/callback/google
http://localhost:3000/api/auth/callback/github
http://localhost:3000/api/auth/callback/linkedin
```

If you use `127.0.0.1` anywhere in env, add **parallel** origins/redirects with `127.0.0.1` — Google treats `localhost` and `127.0.0.1` as different.

---

## Optional cleanup

```bash
docker compose down --rmi local
# Prune unused images (careful — global)
docker image prune -f
```
