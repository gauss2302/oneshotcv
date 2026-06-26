# oneshotcv — root task runner.
# Two independent apps (backend/, frontend/), each with its own package.json.
# This Makefile just wraps the per-app npm scripts and docker compose flows.

BACKEND  := backend
FRONTEND := frontend

# Local stack auto-loads docker-compose.override.yml (Postgres + MinIO).
# Prod stack uses only docker-compose.yml (external Postgres/MinIO).
COMPOSE      := docker compose
COMPOSE_PROD := docker compose -f docker-compose.yml

.DEFAULT_GOAL := help

.PHONY: help install install-backend install-frontend \
        dev dev-backend dev-frontend \
        typecheck typecheck-backend typecheck-frontend \
        lint test build build-backend build-frontend \
        db-generate db-migrate db-check \
        check \
        up down restart logs ps build-images \
        prod-up prod-down prod-logs clean

## ---- Help ----------------------------------------------------------------

help: ## Show this help
	@grep -E '^[a-zA-Z0-9_-]+:.*?## .*$$' $(MAKEFILE_LIST) \
		| sort \
		| awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-20s\033[0m %s\n", $$1, $$2}'

## ---- Install -------------------------------------------------------------

install: install-backend install-frontend ## Install deps for both apps

install-backend: ## npm install in backend/
	cd $(BACKEND) && npm install

install-frontend: ## npm install in frontend/
	cd $(FRONTEND) && npm install

## ---- Dev -----------------------------------------------------------------

dev: ## Run backend + frontend dev servers together
	$(MAKE) -j2 dev-backend dev-frontend

dev-backend: ## Backend dev server (port 4000)
	cd $(BACKEND) && npm run dev

dev-frontend: ## Frontend dev server (port 3000)
	cd $(FRONTEND) && npm run dev

## ---- Quality -------------------------------------------------------------

check: typecheck lint test ## Typecheck both apps, lint frontend, run backend tests

typecheck: typecheck-backend typecheck-frontend ## Typecheck both apps

typecheck-backend: ## tsc --noEmit (backend)
	cd $(BACKEND) && npm run typecheck

typecheck-frontend: ## tsc --noEmit (frontend)
	cd $(FRONTEND) && npm run typecheck

lint: ## ESLint (frontend)
	cd $(FRONTEND) && npm run lint

test: ## Vitest (backend)
	cd $(BACKEND) && npm test

## ---- Build ---------------------------------------------------------------

build: build-backend build-frontend ## Build both apps

build-backend: ## tsup build (backend)
	cd $(BACKEND) && npm run build

build-frontend: ## next build (frontend)
	cd $(FRONTEND) && npm run build

## ---- Database (backend) --------------------------------------------------

db-generate: ## Generate SQL migrations from schema.ts
	cd $(BACKEND) && npm run db:generate

db-migrate: ## Apply migrations
	cd $(BACKEND) && npm run db:migrate

db-check: ## drizzle-kit check
	cd $(BACKEND) && npm run db:check

## ---- Docker (local stack: + Postgres + MinIO) ----------------------------

up: ## Start local stack in background (nginx + apps + Postgres + MinIO)
	$(COMPOSE) up -d

down: ## Stop local stack
	$(COMPOSE) down

restart: down up ## Restart local stack

build-images: ## Build local stack images
	$(COMPOSE) build

logs: ## Tail local stack logs
	$(COMPOSE) logs -f

ps: ## Show local stack containers
	$(COMPOSE) ps

## ---- Docker (prod stack: external Postgres/MinIO) ------------------------

prod-up: ## Start prod stack (no local Postgres/MinIO)
	$(COMPOSE_PROD) up -d

prod-down: ## Stop prod stack
	$(COMPOSE_PROD) down

prod-logs: ## Tail prod stack logs
	$(COMPOSE_PROD) logs -f

## ---- Cleanup -------------------------------------------------------------

clean: ## Stop local stack and remove its volumes (DROPS local DB + MinIO data)
	$(COMPOSE) down -v
