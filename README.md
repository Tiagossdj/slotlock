# SlotLock API

A resource-aware scheduling API that prevents double booking by validating multiple resources simultaneously using pessimistic locking.

## The Problem

Traditional booking systems check only time conflicts. SlotLock validates all required resources simultaneously — professional, room, and equipment — preventing scenarios where a service is booked but a required resource is unavailable.

## Tech Stack

- **Runtime**: Node.js + TypeScript
- **Framework**: Fastify
- **ORM**: Drizzle ORM
- **Database**: PostgreSQL 16
- **Validation**: JSON Schema + json-schema-to-ts
- **Testing**: Vitest
- **Linting**: Biome

## Architecture
```
src/
├── modules/          # Feature modules (resources, services, appointments)
│   └── {module}/
│       ├── domain/   # Entities, repository interfaces, business logic
│       ├── infra/    # Drizzle repositories, HTTP controllers and routes
│       └── dtos/     # JSON Schema input/output definitions
├── infra/            # Shared infrastructure (Fastify server, Swagger)
├── core/             # Shared error classes
└── config/           # Environment validation
```

Each module follows Clean Architecture principles — domain layer has zero framework dependencies.

## Concurrency Strategy

Appointments use `SELECT FOR UPDATE` (pessimistic locking) inside a transaction to prevent race conditions when multiple bookings attempt to reserve the same resources simultaneously.

## Getting Started

### Prerequisites
- Node.js 18+
- Docker

### Setup
```bash
# start database
docker compose up -d

# install dependencies
cd api && pnpm install

# run migrations
pnpm drizzle-kit migrate

# seed database
pnpm seed

# start development server
pnpm dev
```

### API Documentation

Swagger UI available at `http://localhost:3000/docs`

## Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | /api/resources | List all resources |
| POST | /api/resources | Create a resource |
| GET | /api/services | List all services |
| POST | /api/services | Create a service |
| GET | /api/appointments | List all appointments |
| POST | /api/appointments | Create an appointment |
| PUT | /api/appointments/:id | Update appointment status |
| GET | /api/availability | Get available slots |

## Testing
```bash
pnpm test:run
```