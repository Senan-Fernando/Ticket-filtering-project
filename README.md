# DeskLine

DeskLine is a small support-desk service. Customers raise **tickets**, which are worked by **agents** (users); the conversation on a ticket is kept as **comments**. Each ticket has a status (`open`, `in_progress`, `resolved`, `closed`), a priority, an optional assignee and an `sla_hours` value. The repo contains the API (`api/`) and the agent-facing web UI (`web/`).

## Prerequisites

- Node.js 20+
- Docker (for PostgreSQL)

## Getting started

### 1. Start the database

```sh
docker compose up -d
```

This starts PostgreSQL 15 on `localhost:5432` (user/password/db: `postgres`/`postgres`/`deskline`) and [Adminer](http://localhost:8081) for poking at the data.

### 2. Install dependencies

```sh
(cd api && npm install)
(cd web && npm install)
```

### 3. Create the schema and seed data

```sh
npm run seed
```

This drops and recreates the tables from `api/db/schema.sql` and loads `api/db/seed.sql`. Safe to re-run whenever you want a fresh dataset.

### 4. Run the API and the web app

In one terminal:

```sh
npm run dev:api
```

The API listens on <http://localhost:3000>.

In another:

```sh
npm run dev:web
```

The web app runs on <http://localhost:5173> and proxies API calls to port 3000.

## Configuration

The API reads `DATABASE_URL` and `PORT` from the environment (an `.env` file in `api/` is also picked up). Defaults match the compose setup — see `.env.example`.

## Tests

```sh
npm test
```

The API test suite runs against a separate `deskline_test` database on the same PostgreSQL instance; it is created automatically on first run. The dev database is not touched.

## API overview

| Method | Path                  | Description                              |
| ------ | --------------------- | ---------------------------------------- |
| GET    | `/tickets`            | List all tickets                         |
| GET    | `/tickets/:id`        | A single ticket with its comments        |
| POST   | `/tickets`            | Create a ticket                          |
| PATCH  | `/tickets/:id/status` | Change a ticket's status                 |

## Project conventions

- All SQL lives in `*.repository.ts` files; route handlers stay thin.
- Database columns are `snake_case`; API responses are `camelCase`, converted in `src/mappers.ts`.
- Errors are thrown as `AppError(statusCode, message)` and rendered by the central error handler in `src/errors.ts`.
- Request validation uses zod schemas in `*.schema.ts` files.
