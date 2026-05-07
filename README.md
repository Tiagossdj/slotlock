# 🔒 SlotLock — Resource-Aware Scheduling API

> A scheduling API that prevents double booking by validating multiple resources simultaneously using pessimistic locking (`SELECT FOR UPDATE`).

[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Fastify](https://img.shields.io/badge/Fastify-5.x-black?logo=fastify)](https://fastify.dev/)
[![Drizzle](https://img.shields.io/badge/Drizzle_ORM-0.45-C5F74F?logo=drizzle)](https://orm.drizzle.team/)
[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-316192?logo=postgresql)](https://www.postgresql.org/)

---
## 🔗 Live Demo
- **Frontend:** https://slotlock-web.vercel.app
- **API Docs:** https://slotlock.up.railway.app/docs

---

## 📑 Table of Contents

- [About](#about)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Authentication](#authentication)
- [Endpoints](#endpoints)
- [Frontend](#frontend)
- [Tests](#tests)
- [Seed Data](#seed-data)
- [Next Steps](#next-steps)
- [Learn More](#learn-more)
- [Known Limitations](#known-limitations)



---

## About

SlotLock is a full-stack scheduling system built for service businesses (salons, clinics, studios) where each service requires multiple resources to be available simultaneously — a professional, a room, and equipment.

The name references the core technical mechanism: **pessimistic locking** via `SELECT FOR UPDATE`, which prevents race conditions when multiple clients attempt to book the same resources at the same time.

---

## Tech Stack

### API
| Technology | Description |
|---|---|
| **TypeScript** | Strict mode, path aliases |
| **Fastify** | High-performance HTTP framework |
| **JSON Schema + json-schema-to-ts** | Validation with type inference (no Zod) |
| **Drizzle ORM** | Type-safe SQL with `pg` driver |
| **PostgreSQL 16** | Primary database |
| **@fastify/jwt** | JWT authentication |
| **@fastify/cookie** | httpOnly cookie management |
| **@fastify/rate-limit** | Rate limiting per IP |
| **Vitest** | Unit + integration testing |
| **Biome** | Linting and formatting |
| **Docker** | Database containerization |

### Frontend
| Technology | Description |
|---|---|
| **Next.js 16** | App Router, TypeScript |
| **TanStack Query** | Server state management and caching |
| **shadcn/ui** | Component library (Nova preset) |
| **Tailwind CSS v4** | Styling |

---

## Architecture

SlotLock follows **Clean Architecture** principles — domain logic has zero framework dependencies.

```mermaid
---
config:
  layout: dagre
  theme: neo
  look: neo
---
flowchart TB
    subgraph HTTP["HTTP Layer"]
        Routes["Routes"] --> Controllers["Controllers"] --> DTOs["DTOs"]
    end
    subgraph Domain["Domain Layer"]
        Entities["Entities"] --> Interfaces["Repository Interfaces"] --> Services["Services"]
    end
    subgraph Infra["Infrastructure Layer"]
        Drizzle["Drizzle ORM"] --> PostgreSQL[("PostgreSQL")]
    end
    HTTP --> Domain --> Infra

    style Routes fill:#fffcde,stroke:#FFF9C4
    style Controllers fill:#fffcde,stroke:#FFF9C4
    style DTOs fill:#fffcde,stroke:#FFF9C4
    style Entities fill:#fffcde,stroke:#FFF9C4
    style Interfaces fill:#fffcde,stroke:#FFF9C4
    style Services fill:#fffcde,stroke:#FFF9C4
    style Drizzle fill:#fffcde,stroke:#FFF9C4
    style PostgreSQL fill:#316192,color:#fff,stroke:#BBDEFB
```

**Key decisions:**

- **Controllers receive plain data** — not `FastifyRequest`. Routes extract params/body and pass them to controllers. This decouples business logic from the HTTP framework entirely.
- **Domain entities are pure TypeScript** — no Drizzle types leak into the domain. Each repository has a `toDomain()` function that maps raw DB rows to domain entities.
- **Repository interfaces** define contracts — swapping Drizzle for Prisma or MongoDB only requires a new implementation, not changes to business logic.
- **httpOnly cookies** JWT tokens are never exposed to JavaScript, mitigating XSS attack risks.

```mermaid
---
config:
  layout: dagre
  theme: mc
  look: neo
---
flowchart TB
    Client["Client / Browser"] -- HTTP Request --> Routes["Routes"]
    Routes -- Plain data --> Controllers["Controllers"]
    Controllers -- Business logic --> Services["Services"]
    Services -- Interface contract --> IRepository["IRepository"]
    IRepository -- Implementation --> DrizzleRepo["DrizzleRepo"]
    DrizzleRepo -- SQL --> PostgreSQL[("PostgreSQL")]
    Services -- AppError / ConflictError --> ErrorHandler["ErrorHandler"]
    ErrorHandler -- JSON response --> Client

    style Client stroke:#00C853,fill:#7af6ae
    style Routes fill:#fffcde,stroke:#FFF9C4
    style Controllers fill:#fffcde,stroke:#FFF9C4
    style Services fill:#fffcde,stroke:#FFF9C4
    style IRepository fill:#fffcde,stroke:#FFF9C4
    style DrizzleRepo fill:#fffcde,stroke:#FFF9C4
    style PostgreSQL fill:#316192,color:#fff,stroke:#BBDEFB
    style ErrorHandler fill:#fdafaf,stroke:#D50000
```

---

## Project Structure

```
slotlock/
├── api/                          # Fastify API
│   ├── src/
│   │   ├── @types/
│   │   │   └── fastify.d.ts      # AppInstance with JsonSchemaToTsProvider
│   │   ├── config/
│   │   │   └── env.ts            # Environment validation (loads .env.test in test env)
│   │   ├── core/
│   │   │   └── errors/           # AppError, ConflictError, NotFoundError
│   │   ├── infra/
│   │   │   ├── database/db.ts    # Drizzle singleton
│   │   │   └── http/
│   │   │       ├── server.ts     # Fastify app factory
│   │   │       ├── error-handler.ts
│   │   │       ├── hooks/
│   │   │       │   └── authenticate.ts   # Cookie + Bearer fallback
│   │   │       └── plugins/
│   │   │           ├── jwt.ts            # @fastify/jwt + @fastify/cookie
│   │   │           └── swagger.ts
│   │   └── modules/
│   │       ├── auth/
│   │       │   ├── domain/services/AuthService.ts
│   │       │   └── infra/http/
│   │       │       ├── auth.controller.ts   # register, login, me
│   │       │       └── auth.routes.ts       # POST /login /register /logout, GET /me
│   │       ├── resources/
│   │       │   ├── domain/
│   │       │   │   ├── entities/Resource.ts
│   │       │   │   └── repositories/IResourceRepository.ts
│   │       │   ├── infra/
│   │       │   │   ├── drizzle/DrizzleResourceRepository.ts
│   │       │   │   └── http/
│   │       │   │       ├── resources.controller.ts
│   │       │   │       └── resources.routes.ts
│   │       │   └── dtos/
│   │       ├── services/         # Same structure as resources
│   │       ├── appointments/
│   │       │   ├── domain/
│   │       │   │   ├── entities/Appointment.ts
│   │       │   │   ├── repositories/IAppointmentRepository.ts
│   │       │   │   └── services/
│   │       │   │       ├── AppointmentService.ts   # Overlap + locking logic
│   │       │   │       └── AvailabilityService.ts  # Hourly slot generation
│   │       │   ├── infra/
│   │       │   │   ├── drizzle/DrizzleAppointmentRepository.ts
│   │       │   │   └── http/
│   │       │   └── dtos/
│   │       └── users/
│   ├── db/
│   │   ├── schema/               # Drizzle table definitions
│   │   ├── migrations/           # Auto-generated by drizzle-kit
│   │   └── seed.ts               # Sample data
│   └── tests/
│       ├── appointments/
│       │   └── overlap.test.ts         # 4 unit tests (mocked repositories)
│       └── integration/
│           └── appointments.integration.test.ts  # 9 integration tests (real DB)
│
├── web/                          # Next.js Frontend
│   ├── app/
│   │   ├── page.tsx              # Dashboard (admin only)
│   │   ├── login/page.tsx        # Login form
│   │   ├── register/page.tsx     # Register form
│   │   ├── resources/page.tsx    # Admin CRUD
│   │   ├── services/page.tsx     # Admin CRUD + resource linking
│   │   ├── appointments/page.tsx # Admin view
│   │   └── availability/page.tsx # Client booking
│   ├── components/
│   │   ├── layout/Sidebar.tsx    # Role-aware navigation
│   │   └── ui/
│   ├── proxy.ts                  # Auth middleware (Next.js)
│   └── lib/
│       ├── api.ts                # Fetch wrapper (credentials: include)
│       ├── auth.ts               # localStorage user state (no token)
│       ├── types.ts              # Shared TypeScript types
│       └── hooks/
│           ├── useAuth.ts        # useMe, useLogin, useRegister, useLogout
│           └── ...               # TanStack Query hooks
│
├── docker-compose.yml            # PostgreSQL container
└── .github/workflows/ci.yml     # Lint + migrate + test on push/PR
```

---

## Getting Started

### Prerequisites
- Node.js 20+
- pnpm
- Docker

### 1. Clone the repository

```bash
git clone https://github.com/Tiagossdj/slotlock.git
cd slotlock
```

### 2. Start the database

```bash
docker compose up -d
```

### 3. Set up the API

```bash
cd api

# Install dependencies
pnpm install

# Copy environment variables
cp .env.example .env

# Run migrations
pnpm drizzle-kit migrate

# Seed the database
pnpm seed

# Start the development server
pnpm dev
```

API available at `http://localhost:3000`  
Swagger docs at `http://localhost:3000/docs`

### 4. Set up the Frontend

```bash
cd web

# Install dependencies
pnpm install

# Copy environment variables
cp .env.example .env.local

# Start the development server
pnpm dev
```

Frontend available at `http://localhost:3001`

---

## Authentication

SlotLock uses **JWT with httpOnly cookies** — the token is never accessible to JavaScript, mitigating XSS attacks.

### Roles

| Role | Access |
|------|--------|
| `admin` | Full CRUD — resources, services, appointments |
| `client` | View availability, create and cancel own appointments |

### How it works

1. `POST /api/auth/login` — validates credentials, sets `slotlock_token` as an httpOnly cookie
2. All subsequent requests send the cookie automatically (`credentials: include`)
3. `GET /api/auth/me` — reads the cookie server-side, returns the authenticated user
4. `POST /api/auth/logout` — clears the cookie on the server

> **Note:** In the deployed version (Vercel + Railway), the JWT token is stored in `localStorage` due to cross-origin cookie restrictions. See [Known Limitations](#known-limitations).

### Rate Limiting

Auth endpoints are rate limited to prevent brute force attacks:

| Endpoint | Limit |
|----------|-------|
| `POST /auth/login` | 5 req / 1 min per IP |
| `POST /auth/register` | 5 req / 1 min per IP |
| All other endpoints | 200 req / 15 min per IP |

### Test credentials (seed data)

```
admin@slotlock.com  →  admin123  (full access)
client@email.com    →  client@03 (availability + own appointments)
```

---

## Endpoints

**Base URL:** `http://localhost:3000/api`

### Auth
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `POST` | `/auth/register` | — | Create account, sets httpOnly cookie |
| `POST` | `/auth/login` | — | Authenticate, sets httpOnly cookie |
| `POST` | `/auth/logout` | ✓ | Clears httpOnly cookie |
| `GET` | `/auth/me` | ✓ | Returns authenticated user |

### Resources
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/resources` | ✓ | List all resources |
| `GET` | `/resources/:id` | ✓ | Get resource by ID |
| `POST` | `/resources` | admin | Create a resource |
| `PUT` | `/resources/:id` | admin | Update a resource |
| `DELETE` | `/resources/:id` | admin | Delete (blocked if linked to services) |

### Services
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/services` | ✓ | List all services (includes linked resources) |
| `GET` | `/services/:id` | ✓ | Get service by ID |
| `POST` | `/services` | admin | Create a service (requires `resourceIds[]`) |
| `PUT` | `/services/:id` | admin | Update a service |
| `DELETE` | `/services/:id` | admin | Delete (blocked if has appointments) |

### Appointments
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/appointments` | ✓ | List appointments (client sees own only) |
| `GET` | `/appointments/:id` | ✓ | Get appointment by ID |
| `POST` | `/appointments` | ✓ | Create (validates resources + locking) |
| `PUT` | `/appointments/:id` | ✓ | Update status |
| `DELETE` | `/appointments/:id` | ✓ | Delete (cascades appointment_resources) |
| `GET` | `/availability` | ✓ | Available slots (`?serviceId=&date=`) |

---

## Frontend

The frontend is a role-aware management dashboard built with Next.js and TanStack Query, featuring a dark gold theme.

**Admin screens:**
- **Dashboard** — overview of the system
- **Resources** — manage professionals, rooms and equipment
- **Services** — manage bookable services, durations and linked resources
- **Appointments** — track and update booking status

**Client screens:**
- **Availability** — browse available slots and book appointments
- **My Appointments** — view and cancel own bookings

### Route Protection

Routes are protected by a Next.js middleware (`proxy.ts`) that reads the `slotlock_token` cookie:

- Unauthenticated users are redirected to `/login`
- Authenticated users trying to access `/login` or `/register` are redirected to `/`
- `/api/*` routes bypass the middleware (handled by Next.js rewrites to the Fastify API)

---

## Tests

**13 tests passing across 2 test files.**

```bash
cd api && pnpm test:run
```

### Unit tests — `tests/appointments/overlap.test.ts`

Tests `AppointmentService` in isolation using mocked repositories:

- ✅ Creates appointment when all resources are available
- ✅ Throws `ConflictError` when a resource is unavailable
- ✅ Throws `NotFoundError` when service does not exist
- ✅ Calculates `endTime` correctly based on service duration

### Integration tests — `tests/integration/appointments.integration.test.ts`

Tests the full stack against a real PostgreSQL database (`slotlock_test`):

- ✅ Creates appointment and links resources in `appointment_resources`
- ✅ Throws `ConflictError` when resource is already booked (real `SELECT FOR UPDATE`)
- ✅ Allows booking when a cancelled appointment frees the resource
- ✅ Throws `NotFoundError` when service does not exist
- ✅ `findAll` returns linked resources via `leftJoin`
- ✅ Returns empty `resources[]` for services with no links
- ✅ Creates service with resource links atomically (transaction)
- ✅ Throws `ConflictError` when deleting a resource linked to a service
- ✅ Deletes resource successfully when not linked

### Setup for integration tests

```bash
# Create the test database (once)
docker exec -it slotlock-db-1 psql -U user -d slotlock -c "CREATE DATABASE slotlock_test;"

# Run migrations on the test database
DATABASE_URL=postgresql://user:password@localhost:5433/slotlock_test npx drizzle-kit migrate
```

---

## Seed Data

The seed creates a realistic salon scenario:

| Type | Data |
|------|------|
| Resources | Ana Paula (professional), Sala 1 (room), Kit Lash (equipment), Carla (professional), Sala 2 (room), Kit Manicure (equipment) |
| Services | Lash Designer (120 min) → Ana Paula + Sala 1 + Kit Lash, Manicure (60 min) → Carla + Sala 2 + Kit Manicure |
| Users | `client@email.com` / `client123`, `admin@slotlock.com` / `admin123` |
| Appointments | Sample confirmed appointments on 2026-06-01 |

---

## Next Steps

- [ ] Pagination on list endpoints
- [ ] UI to edit service-resource links (add/remove resources from existing services)

---

## Learn More

Technical decisions, architecture details and known trade-offs are documented in [`api/docs/`](./api/docs):

- [`decisions.md`](./api/docs/decisions.md) — why each technology and approach was chosen
- [`architecture.md`](./api/docs/architecture.md) — system components and layers
- [`ai-context.md`](./api/docs/ai-context.md) — context for AI coding tools

---

## Known Limitations

### Authentication Storage
JWT tokens are stored in `localStorage` due to cross-origin restrictions between 
the deployment platforms (Vercel/Railway). In a production environment with a 
custom domain, the recommendation would be to use `httpOnly` cookies with 
`SameSite: Strict` for better security against XSS attacks.

⭐ If this project helped you, leave a star!
