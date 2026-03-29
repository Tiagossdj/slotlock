# AI Context

This file provides structured context for AI coding tools such as Claude Code, Cursor, or Copilot.

It summarizes the architecture, constraints, and conventions used in this repository so AI assistants can generate code consistent with the project design.

For human-readable documentation see:

- `README.md`
- `docs/architecture.md`
- `docs/decisions.md`

---

## Project Overview

SlotLock is a resource-aware scheduling API.

Unlike a simple CRUD booking system, an appointment can require multiple resources simultaneously.  
A booking is only valid if **all required resources are available during the same time window**.

**Example:** a beauty appointment may require one professional, one room, and one equipment unit.  
If any resource is busy, the slot is unavailable.

The system prevents double booking using **pessimistic locking in PostgreSQL**.

---

## Repository Structure

```
slotlock/
├── api/              # Fastify + Drizzle backend
├── web/              # Next.js frontend
├── docker-compose.yml
├── pnpm-workspace.yaml
└── docs/
```

The backend and frontend are part of a **pnpm monorepo** with a shared `pnpm-lock.yaml` at the root.

---

## Backend Structure

```
api/src/
├── @types/    # FastifyInstance augmentation (AppInstance with JsonSchemaToTsProvider)
├── core/      # shared domain errors (AppError, ConflictError, NotFoundError)
├── config/    # environment config
├── infra/     # infrastructure (db, http, swagger, error-handler)
├── modules/   # domain modules
└── shared/    # utilities
```

Each module follows a layered structure:

```
domain/
  entities/          # pure TypeScript interfaces — no Drizzle types
  repositories/      # interfaces (contracts)
  services/          # business logic
infra/
  drizzle/           # concrete repository implementations with toDomain()
  http/              # controllers and routes
dtos/                # JSON schemas (as const) and inferred types
```

Dependency direction: `Route → Controller → Service → Repository Interface`

Controllers receive plain data — not `FastifyRequest`. Routes extract params/body and pass them to controllers.

Repositories are injected manually — no DI framework.

---

## Technology Stack

**Backend:** TypeScript (strict), Fastify 5, Drizzle ORM, PostgreSQL 16, `json-schema-to-ts`, `@fastify/type-provider-json-schema-to-ts`, Vitest, Biome, fastify-plugin

**Frontend:** Next.js 16 (App Router), TanStack Query v5, Tailwind CSS v4, shadcn/ui (Nova preset)

**Infrastructure:** Docker (PostgreSQL on port 5433), GitHub Actions CI

---

## Database Design

```
users
resources
services
service_resources         # which resources a service requires
appointments
appointment_resources     # which resources are locked per appointment
```

Appointments store the time window and the linked resources.  
Resource conflicts are detected at booking time inside a transaction.

After creating an appointment, the system calls `linkResources()` to insert into `appointment_resources`. Without this, the `SELECT FOR UPDATE` overlap check will not detect conflicts.

---

## Concurrency Strategy

The core technical mechanism is **pessimistic locking**:

```sql
SELECT ar.resource_id as "resourceId"
FROM appointment_resources ar
INNER JOIN appointments a ON a.id = ar.appointment_id
WHERE ar.resource_id = ANY(ARRAY[$1, $2, $3]::uuid[])
AND a.status != 'cancelled'
AND (a.start_time, a.end_time) OVERLAPS ($4::timestamptz, $5::timestamptz)
FOR UPDATE
```

During booking:

1. Start database transaction
2. Query overlapping appointments for requested resources using `sql.join` for the `ANY(ARRAY[...])` syntax
3. Lock rows with `FOR UPDATE`
4. If conflicts exist → throw `ConflictError` (409)
5. Otherwise → create appointment + link resources

---

## Time Handling

All timestamps are stored in **UTC** using `withTimezone: true` in Drizzle.

```typescript
timestamp('start_time', {
  withTimezone: true,   // stores as TIMESTAMP WITH TIME ZONE
  mode: 'string'        // avoids JS Date implicit conversions
})
```

The frontend sends ISO 8601 strings in UTC. The frontend is responsible for displaying times in the user's local timezone using `toLocaleString()` or `toLocaleTimeString()` with `timeZone` option.

The `AvailabilityService` generates slots using local time (`setHours` not `setUTCHours`) and parses the date string as local:

```typescript
const [year, month, day] = date.split('-').map(Number)
const baseDate = new Date(year, month - 1, day)
```

---

## Domain Entities

Repository interfaces use pure TypeScript entities — not Drizzle's `InferSelectModel`.

Each Drizzle repository has a `toDomain()` function:

```typescript
function toDomain(raw: typeof resources.$inferSelect): Resource {
  return {
    id: raw.id,
    name: raw.name,
    type: raw.type as Resource['type'],
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt,
  }
}
```

This isolates the domain from the ORM. Changing from Drizzle to Prisma only requires updating the `infra/drizzle/` implementations.

---

## Delete Constraints

- **Resources:** blocked if linked to any service via `service_resources` → throws `ConflictError` (409)
- **Appointments:** cascades — deletes `appointment_resources` first, then the appointment
- **Services:** no cascade constraints currently

---

## Coding Conventions

- JSON Schema for validation (not Zod) — always use `as const` on input schemas (`body`, `params`, `querystring`)
- Response schemas without `as const` — avoids type conflicts with domain entities
- `json-schema-to-ts` for type inference
- `AppInstance` type in `src/@types/fastify.d.ts` — use instead of raw `FastifyInstance` in routes
- Drizzle ORM (not Prisma)
- Manual dependency injection
- Services contain business logic — controllers stay thin and receive plain data
- Avoid introducing new patterns or libraries without updating `docs/decisions.md`

---

## CI/CD

GitHub Actions runs on push/PR to `main`:

1. Setup pnpm (version from `packageManager` field)
2. Install dependencies
3. Run Biome lint check
4. Run Drizzle migrations against a PostgreSQL service container
5. Run Vitest unit tests

---

## Out of Scope

The following features are intentionally not implemented:

- Authentication (JWT) — planned next step
- Payment workflows
- Pending booking TTL locks (`pending_bookings` table)
- Background job scheduling

These are documented as possible future improvements in `docs/decisions.md`.