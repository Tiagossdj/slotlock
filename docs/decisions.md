# Technical Decisions

This document explains the reasoning behind important architectural choices in SlotLock.

---

## Fastify instead of Express

**Decision:** use Fastify as the HTTP framework.

**Reasons:**
- Better performance than Express
- Strong TypeScript ecosystem

**What was considered:** Express is more popular and has a larger ecosystem, but it requires external libraries for schema validation and has weaker TypeScript support out of the box.

---

## JSON Schema instead of Zod

**Decision:** use JSON Schema natively for request validation.

**Reasons:**
- Fastify internally uses JSON Schema — adding Zod would create a second validation layer
- Keeps the validation pipeline simple and consistent
- TypeScript types are derived using `json-schema-to-ts`

**What was considered:** Zod provides a better developer experience for type inference, but introduces unnecessary overhead when the framework already handles validation natively.

---

## Drizzle instead of Prisma

**Decision:** use Drizzle ORM for database access.

**Reasons:**
- SQL-first approach — closer to raw SQL
- Strong type inference without a separate code generation step
- Lightweight runtime with no binary dependencies

**What was considered:** Prisma is more mature and has better documentation, but abstracts SQL in ways that make advanced queries harder to control. Since the booking logic relies on `SELECT FOR UPDATE` inside transactions, being closer to SQL is a better fit.

---

## Pessimistic Locking

**Decision:** use `SELECT FOR UPDATE` to prevent double booking.

**Reasons:**
- Simple to implement within a single PostgreSQL instance
- Reliable — the database engine handles the concurrency guarantees
- No external infrastructure required

**What was considered:**
- *Optimistic locking* — would require retry logic on the application side
- *Pending bookings table with TTL* — a valid pattern for payment flows, but requires a background job to expire records; out of scope for now

---

## Manual Dependency Injection

**Decision:** instantiate and inject dependencies manually in the HTTP layer.

**Reasons:**
- Keeps the project simple
- No framework — dependencies are explicit and easy to trace
- Appropriate for a small codebase

**What was considered:** DI frameworks like InversifyJS add abstractions that are harder to justify in a project of this size.

---

## UTC Timestamps stored as strings

**Decision:** store all timestamps in UTC using `mode: 'string'` in Drizzle.

**Reasons:**
- JavaScript `Date` objects automatically apply the machine timezone, which causes subtle bugs in scheduling logic
- Storing as strings avoids implicit conversions at the ORM level
- The frontend is responsible for displaying times in the user's local timezone

**What was considered:** using `mode: 'date'` is simpler but introduces timezone inconsistencies depending on where the server runs.