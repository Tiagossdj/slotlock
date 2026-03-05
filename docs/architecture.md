# Architecture

## Overview

SlotLock is a resource-aware scheduling API designed to prevent double booking when multiple resources are required for a single appointment.

Unlike simple booking systems, each appointment may require several resources simultaneously — for example: a professional, a room, and a piece of equipment.

The system guarantees consistency by validating resource availability inside a database transaction.

---

## Repository Structure

The repository contains two independent applications:

```
slotlock/
├── api/   → Backend API
├── web/   → Frontend application
├── docker-compose.yml
└── docs/
```

The backend exposes HTTP endpoints and manages business rules and database interactions.  
The frontend consumes the API and provides the booking interface.

---

## Backend Architecture

The backend follows a layered architecture:

```
Controller → Service → Repository
```

| Layer | Responsibility |
|---|---|
| Controller | Handles HTTP requests, validates input, calls services |
| Service | Contains business rules, orchestrates repositories |
| Repository | Interacts with the database, contains SQL/ORM logic |

---

## Module Organization

Each domain module follows the same internal structure:

```
modules/<module>/
├── domain/
│   ├── entities/
│   └── repositories/    # interfaces (contracts)
├── infra/
│   ├── drizzle/         # concrete repository implementations
│   └── http/            # controllers and routes
└── dtos/                # JSON schemas and inferred types
```

Current modules: `resources`, `services`, `appointments`

---

## Database Layer

The application uses PostgreSQL with Drizzle ORM.

**Main tables:**

| Table | Purpose |
|---|---|
| `users` | Authentication and profile |
| `resources` | Professionals, rooms, equipment |
| `services` | Service catalog (e.g. Manicure 60min) |
| `appointments` | Booking records |

**Join tables:**

| Table | Purpose |
|---|---|
| `service_resources` | Which resources a service requires |
| `appointment_resources` | Which resources are locked per appointment |

These tables allow flexible combinations of services and resources.

---

## Concurrency Strategy

To avoid double booking, the system uses **pessimistic locking**.

During appointment creation:

1. Start a database transaction
2. Query conflicting appointments for the requested resources
3. Lock matching rows using `SELECT FOR UPDATE`
4. If conflicts exist → reject the request
5. Otherwise → create the appointment

This ensures that two concurrent requests cannot reserve the same slot.

---

## Time Handling

All timestamps are stored in **UTC**.

The database stores timestamps as strings instead of JavaScript Date objects to avoid implicit timezone conversions.

Timezone conversion is the responsibility of the frontend.