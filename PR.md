# Ticket list filtering + SLA indicator

## What changed

**Filtering** — `GET /tickets` now accepts optional query params, combinable and both optional:

- `status=open|in_progress|resolved|closed`
- `assigneeId=<userId>` or `assigneeId=unassigned`

Invalid values return `400 Validation failed`. The UI gains two dropdowns above the ticket table that refetch on change.

**SLA indicator** — every ticket in the API response now includes `slaStatus`:

- `ok` — resolved within `sla_hours`, or unresolved with time to spare
- `at_risk` — unresolved and ≥75% of the SLA window used
- `breached` — not resolved within `sla_hours` of creation

Rendered as a color-coded badge in a new SLA column.

**Drive-by fix** — `listTickets` had an N+1 (two extra queries per ticket); it now uses one query with the same join/subselect shape as `getTicketById`. See `DECISIONS.md` for assumptions and flagged issues.

## How to review

Read in this order (mirrors the data flow):

1. `api/src/tickets/tickets.schema.ts` — new `listTicketsQuerySchema`
2. `api/src/tickets/tickets.repository.ts` — dynamic parameterized `where` + N+1 fix
3. `api/src/mappers.ts` — `computeSlaStatus` (pure function; the SLA rules live here) and the new `slaStatus` DTO field
4. `api/src/tickets/tickets.routes.ts` — one-line wiring of query parsing
5. `web/src/TicketList.tsx` — filter controls, refetch effect, SLA badge column (+ `types.ts`, `styles.css`)
6. Tests: `api/test/tickets.test.ts` (filters + SLA through the endpoint, fixtures extended in `test/helpers.ts`), `api/test/sla.test.ts` (boundary cases for `computeSlaStatus`)

## How to test

```sh
docker compose up -d
npm test                        # 18 tests, incl. filter combinations and SLA edges
npm run seed && npm run dev:api # then npm run dev:web, open http://localhost:5173
```

In the UI: try each dropdown alone, both together, and "Unassigned"; the seeded data includes on-track and breached tickets so all badge colors are visible.
