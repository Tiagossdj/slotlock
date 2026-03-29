# Architecture

## Overview

SlotLock is a resource-aware scheduling system designed to prevent double booking when multiple resources are required for a single appointment.

Unlike simple booking systems, each appointment may require several resources simultaneously — for example: a professional, a room, and a piece of equipment.

The system guarantees consistency by validating resource availability inside a database transaction using pessimistic locking.

---

## Repository Structure

The repository is a **pnpm monorepo** containing two independent applications:

```
slotlock/
├── api/                  → Backend API (Fastify + Drizzle)
├── web/                  → Frontend (Next.js)
├── docker-compose.yml    → PostgreSQL container
├── pnpm-workspace.yaml   → Monorepo configuration
└── docs/
```

---

## Backend Architecture

The backend follows **Clean Architecture** principles — domain logic has zero framework dependencies.

```
┌─────────────────────────────────────────────────────────┐
│                    HTTP Layer                           │
│         Routes → Controllers → DTOs                    │
├─────────────────────────────────────────────────────────┤
│                   Domain Layer                          │
│      Entities → Repository Interfaces → Services       │
├─────────────────────────────────────────────────────────┤
│               Infrastructure Layer                      │
│       Drizzle Repositories → PostgreSQL                 │
└─────────────────────────────────────────────────────────┘
```

**Key principle:** arrows point inward. The domain layer knows nothing about Fastify, Drizzle, or PostgreSQL.

| Layer | Responsibility |
|---|---|
| Routes | Register HTTP endpoints, extract request data, pass to controller |
| Controllers | Receive plain data, call services or repositories, return results |
| Services | Business logic, orchestrate repositories |
| Repository interfaces | Contracts — define what can be done with data |
| Drizzle repositories | Implement contracts, map DB rows to domain entities via `toDomain()` |

---

## Module Organization

Each domain module follows the same internal structure:

```
modules/<module>/
├── domain/
│   ├── entities/          # pure TypeScript interfaces
│   ├── repositories/      # interfaces (contracts)
│   └── services/          # business logic
├── infra/
│   ├── drizzle/           # concrete repository implementations
│   └── http/              # controllers and routes
└── dtos/                  # JSON schemas and inferred types
```

Current modules: `resources`, `services`, `appointments`, `users`

---

## Frontend Architecture

The frontend is a Next.js App Router application that consumes the API.

```
web/
├── app/              # Pages (one folder per route)
├── components/       # Shared UI components
└── lib/
    ├── api.ts        # Fetch wrapper (handles 204, Content-Type)
    ├── types.ts      # Shared TypeScript types
    └── hooks/        # TanStack Query hooks per module
```

TanStack Query manages all server state — caching, invalidation, loading/error states.

---

## Database Layer

PostgreSQL 16 via Drizzle ORM.

**Main tables:**

| Table | Purpose |
|---|---|
| `users` | User accounts |
| `resources` | Professionals, rooms, equipment |
| `services` | Service catalog (e.g. Manicure 60min) |
| `appointments` | Booking records with start/end time |

**Join tables:**

| Table | Purpose |
|---|---|
| `service_resources` | Which resources a service requires |
| `appointment_resources` | Which resources are locked per appointment |

---

## Concurrency Strategy

To avoid double booking, the system uses **pessimistic locking** (`SELECT FOR UPDATE`) inside a PostgreSQL transaction.

During appointment creation:

1. Start a database transaction
2. Query conflicting appointments for the requested resources
3. Lock matching rows using `FOR UPDATE`
4. If conflicts exist → reject the request with `ConflictError` (409)
5. Otherwise → create the appointment and link resources via `appointment_resources`

This ensures that two concurrent requests cannot reserve the same slot.

---

## Time Handling

All timestamps are stored in **UTC** using `TIMESTAMP WITH TIME ZONE` (`withTimezone: true` in Drizzle).

- The API receives ISO 8601 strings in UTC from the frontend
- The `AvailabilityService` generates slots in local time using `setHours` (not `setUTCHours`) and parses date strings as local to avoid UTC offset issues
- The frontend converts UTC timestamps to local time for display using `toLocaleString()` with `timeZone` option

---

## CI/CD

GitHub Actions runs on every push and pull request to `main`:

1. Spin up a PostgreSQL 16 service container
2. Install dependencies via pnpm
3. Run Biome lint check
4. Run Drizzle migrations
5. Run Vitest unit tests

Merging to `main` is only allowed if all checks pass.