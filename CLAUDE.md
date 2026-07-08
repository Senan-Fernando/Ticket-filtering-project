# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

DeskLine is a support-desk service: customers raise tickets, agents (users) work them, conversation is stored as comments. Two npm workspaces-by-convention (not actual workspaces): `api/` (Fastify + pg + zod, TypeScript ESM run with tsx) and `web/` (React + Vite, proxies `/tickets` etc. to port 3000). PostgreSQL 15 runs via Docker Compose (with Adminer on :8081).

## Commands

Run from the repo root (these delegate via `npm --prefix`):

- `docker compose up -d` — start PostgreSQL (postgres/postgres/deskline on :5432); required before seed/dev/test
- `npm run seed` — drop/recreate tables from `api/db/schema.sql` and load `api/db/seed.sql`
- `npm run dev:api` — API on http://localhost:3000 (tsx watch)
- `npm run dev:web` — web UI on http://localhost:5173
- `npm test` — API test suite (vitest)

Inside `api/`:

- `npx vitest run test/tickets.test.ts` — run a single test file (`npx vitest run -t "name"` for one test)
- `npm run typecheck` — `tsc --noEmit`

Tests use a separate `deskline_test` database (auto-created on first run by `test/helpers.ts`; connection set in `vitest.config.ts`, override with `DATABASE_URL_TEST`). Each test run drops and recreates tables with its own fixtures; the dev database is untouched. `fileParallelism` is disabled because tests share one database.

## Architecture

- `api/src/server.ts` exports `buildServer()` (used by tests via Fastify's `app.inject()`) and only listens when run as the main module. Config comes from `DATABASE_URL` / `PORT` (dotenv loads `api/.env`).
- Feature folders under `api/src/` (`tickets/`, `comments/`, `users/`) each follow the same three-file pattern:
  - `*.routes.ts` — thin Fastify handlers
  - `*.repository.ts` — **all SQL lives here**, using the shared pool from `src/db.ts`
  - `*.schema.ts` — zod request validation
- `src/mappers.ts` converts DB rows (`snake_case`) to API responses (`camelCase`). Keep that boundary: never leak snake_case out of a route.
- Errors are thrown as `AppError(statusCode, message)` (`src/errors.ts`) and rendered by the central error handler registered in `buildServer()`.
- Ticket statuses: `open`, `in_progress`, `resolved`, `closed`; tickets also carry priority, optional `assignee_id`, and `sla_hours`.
- `web/src/` is a small React app (`TicketList`, `TicketDetail`) calling the API through `api.ts`; Vite dev server proxies API requests to :3000.
