# Technical Decisions

This document explains the reasoning behind important architectural choices in SlotLock.

---

## Fastify instead of Express

**Decision:** use Fastify as the HTTP framework.

**Reasons:**

- Better performance than Express
- Strong TypeScript ecosystem
- Native JSON Schema validation — no additional validation library needed

**What was considered:** Express is more popular and has a larger ecosystem, but it requires external libraries for schema validation and has weaker TypeScript support out of the box.

---

## JSON Schema instead of Zod

**Decision:** use JSON Schema natively for request validation.

**Reasons:**

- Fastify internally uses JSON Schema — adding Zod would create a second validation layer
- Keeps the validation pipeline simple and consistent
- TypeScript types are derived using `json-schema-to-ts`

**Constraint:** input schemas (`body`, `params`, `querystring`) must use `as const` for type inference to work. Response schemas must NOT use `as const` — this avoids type conflicts between the inferred schema type and domain entities.

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

- _Optimistic locking_ — would require retry logic on the application side
- _Pending bookings table with TTL_ — a valid pattern for payment flows, but requires a background job to expire records; out of scope for now

---

## Manual Dependency Injection

**Decision:** instantiate and inject dependencies manually in the HTTP layer.

**Reasons:**

- Keeps the project simple
- No framework — dependencies are explicit and easy to trace
- Appropriate for a small codebase

**What was considered:** DI frameworks like InversifyJS add abstractions that are harder to justify in a project of this size.

---

## UTC Timestamps with Timezone

**Decision:** store all timestamps in UTC using `withTimezone: true` and `mode: 'string'` in Drizzle.

```typescript
timestamp('start_time', {
  withTimezone: true,
  mode: 'string'
})
```

**Reasons:**

- `withTimezone: true` stores as `TIMESTAMP WITH TIME ZONE` — PostgreSQL normalizes to UTC
- `mode: 'string'` avoids implicit timezone conversions by JavaScript `Date` objects
- The frontend is responsible for displaying times in the user's local timezone

**What was considered:** using `mode: 'date'` is simpler but introduces timezone inconsistencies depending on where the server runs. Using `withTimezone: false` (previous approach) caused issues when comparing timestamps stored without timezone against UTC values from the frontend.

---

## Domain Entities separate from Drizzle types

**Decision:** define pure TypeScript interfaces as domain entities instead of using `InferSelectModel` from Drizzle directly in repository interfaces.

```typescript
// domain entity — no Drizzle dependency
export interface Resource {
  id: string
  name: string
  type: 'professional' | 'room' | 'equipment'
  createdAt: string
  updatedAt: string
}

// repository interface uses the domain entity
export interface IResourceRepository {
  findById(id: string): Promise<Resource | null>
  // ...
}
```

Each Drizzle repository implements a `toDomain()` mapping function internally.

**Reasons:**

- The domain layer has zero ORM dependencies
- Swapping Drizzle for another ORM only requires updating `infra/drizzle/` implementations
- Repository interfaces are stable — changing the DB schema only affects the mapping layer

**What was considered:** using `InferSelectModel` directly is faster to write and less code, but leaks ORM types into the domain layer. This was the initial approach and was refactored after the resources module was complete.

---

## Controllers receive plain data, not FastifyRequest

**Decision:** routes extract request data and pass plain values to controllers. Controllers do not receive `FastifyRequest` or `FastifyReply`.

```typescript
// route
app.post('/resources', { schema }, async (req, reply) => {
  const resource = await controller.create(req.body)
  return reply.status(201).send(resource)
})

// controller
async create(data: CreateResourceBody) {
  return await this.resourceRepository.create(data)
}
```

**Reasons:**

- Controllers are fully decoupled from the HTTP framework
- Controllers can be tested without mocking Fastify objects
- Switching from Fastify to another framework only requires updating routes

**What was considered:** passing `req` and `reply` directly to controllers is simpler and common in Node.js projects, but creates a tight coupling between business logic and the HTTP layer.

---

## Delete constraints

**Decision:** block resource deletion if the resource is linked to any service. Allow appointment deletion with cascade to `appointment_resources`.

**Reasons:**

- Deleting a resource linked to a service would silently break the service configuration
- Appointment resources are not independently meaningful — they exist only in the context of the appointment

**What was considered:** cascading all deletes at the database level via `ON DELETE CASCADE`. Rejected because it would silently remove data without giving the user a chance to reconfigure.

---

## AppInstance type for routes

**Decision:** use a custom `AppInstance` type that wraps `FastifyInstance` with `JsonSchemaToTsProvider`.

```typescript
// src/@types/fastify.d.ts
export type AppInstance = FastifyInstance<
  Server,
  IncomingMessage,
  ServerResponse,
  FastifyBaseLogger,
  JsonSchemaToTsProvider
>
```

**Reasons:**

- `JsonSchemaToTsProvider` automatically infers request types from JSON Schemas
- Without it, `req.body`, `req.params` and `req.query` are typed as `unknown`
- Centralizes the type provider configuration

**What was considered:** using `withTypeProvider<JsonSchemaToTsProvider>()` inside each route function. This caused the Swagger plugin to not detect routes registered in a different encapsulation context, resulting in empty `paths` in the OpenAPI spec.