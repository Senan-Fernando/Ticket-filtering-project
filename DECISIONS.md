# Decision Log

## Assumptions I made

- The brief only defines "breached". I added a third **`at_risk`** state (unresolved and ≥75% of the SLA window used) so agents can act *before* a breach — the stated goal was "see at a glance which tickets need attention". The threshold is a named constant in `api/src/mappers.ts`.
- For **resolved tickets**, SLA is judged against `resolved_at` (did it beat the deadline?), not the current time — a ticket resolved in time stays "ok" forever.
- A **`closed` ticket without `resolved_at`** is treated as unresolved (it can still breach). The status flow doesn't guarantee `resolved_at` is set before closing, so this felt like the safer default.
- The assignee filter accepts the special value **`assigneeId=unassigned`** in addition to a user id, since triaging the unassigned queue is a common support workflow.
- Invalid filter values return **400** (consistent with the existing zod → `Validation failed` handling) rather than being silently ignored.

## Design decisions

- **Filtering happens in SQL**, not in memory — parameterized `where` clauses built in `tickets.repository.ts`, keeping all SQL in the repository per the repo convention.
- **`slaStatus` is computed in the API** (`computeSlaStatus` in `mappers.ts`), not in SQL and not in the browser: it stays a pure, unit-testable function with an injectable `now`, and the client can't disagree with the server about breach state.
- The filter query schema lives in `tickets.schema.ts` and the route handler stays thin, matching the existing route pattern.
- **Assignee dropdown options** are derived from the initial unfiltered ticket load rather than a new `GET /users` endpoint — smallest reviewable change. Trade-off: an agent with zero tickets won't appear as an option (see "more time").

## Where I used AI

- Used Claude Code for the whole change: exploration, plan, implementation, and tests. I reviewed the plan before implementation and chose the 3-state badge and the `unassigned` filter option when it asked. All tests, typecheck, and the web build were run and pass.

## Anything I noticed in the existing code

- **Fixed:** `listTickets` had an N+1 query problem — one query per ticket for the assignee name plus one per ticket for the comment count. It now uses the same single join + subselect query shape as `getTicketById`.
- **Flagged, not fixed:** `PATCH /tickets/:id/status` sets `resolved_at` when moving to `resolved`, but never clears it when a ticket is reopened. A reopened ticket therefore keeps its old `resolved_at` and its SLA status stays frozen at the old resolution. Left alone to keep this PR scoped, but worth a follow-up.
- `comments.repository.ts#countForTicket` is now unused after the N+1 fix; left in place since removing it is unrelated cleanup.
- No indexes on `tickets.status` / `tickets.assignee_id`; fine at this data size, worth adding if the table grows.

## What I'd do with more time

- A `GET /users` endpoint so the assignee filter lists all agents, not just ones with tickets.
- Persist filters in the URL hash so filtered views are shareable/bookmarkable and survive refresh.
- Sort or visually group the list so breached/at-risk tickets float to the top.
- Fix the reopen/`resolved_at` bug above, with a test.
- Basic component tests for the web app (there's currently no web test setup).
