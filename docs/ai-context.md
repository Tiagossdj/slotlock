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
└── docs/
```

The backend and frontend are independent projects with separate `package.json` files.

---

## Backend Structure

```
api/src/
├── core/      # shared domain errors
├── config/    # environment config
├── infra/     # infrastructure (db, http)
├── modules/   # domain modules
└── shared/    # utilities
```

Each module follows a layered structure:

```
domain/    # entities + repository interfaces
infra/     # implementations (drizzle, http)
dtos/      # JSON schemas and inferred types
```

Dependency direction: `Controller → Service → Repository`

Repositories are injected manually — no DI framework.

---

## Technology Stack

**Backend:** TypeScript (strict), Fastify, Drizzle ORM, PostgreSQL, `json-schema-to-ts`, Vitest, Biome

**Frontend:** Next.js, TanStack Query, tailwindCSS + shadcn(for components)

**Infrastructure:** Docker, GitHub Actions (later phase)

---

## Database Design

```
users
resources
services
service_resources
appointments
appointment_resources
```

Appointments store the time window and the linked resources.  
Resource conflicts are detected at booking time inside a transaction.

---

## Concurrency Strategy

The core technical mechanism is **pessimistic locking**:

```sql
SELECT ... FOR UPDATE
```

During booking:

1. Start database transaction
2. Query overlapping appointments for requested resources
3. Lock rows with `FOR UPDATE`
4. If conflicts exist → reject booking
5. Otherwise → create appointment

This prevents double booking under concurrent requests.

---

## Time Handling

All timestamps are stored in **UTC**.

Drizzle timestamp configuration:

```typescript
timestamp('start_time', {
  withTimezone: false,
  mode: 'string'
})
```

This avoids implicit timezone conversion by JavaScript Date objects.  
The frontend converts timestamps to the user's local timezone.

---

## Coding Conventions

- JSON Schema for validation (not Zod)
- `json-schema-to-ts` for type inference — always use `as const` on schemas
- Drizzle ORM (not Prisma)
- Manual dependency injection
- Services contain business logic — controllers stay thin
- Avoid introducing new patterns or libraries without updating `docs/decisions.md`

---

## Out of Scope

The following features are intentionally not implemented:

- Payment workflows
- Pending booking TTL locks (`pending_bookings` table)
- Background job scheduling

These are documented as possible future improvements in `docs/decisions.md`.