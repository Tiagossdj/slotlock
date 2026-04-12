import { eq } from 'drizzle-orm'
import { drizzle } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'
import {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
} from 'vitest'
import * as schema from '../../db/schema'
import { ConflictError } from '../../src/core/errors/ConflictError'
import { NotFoundError } from '../../src/core/errors/NotFoundError'
import { AppointmentService } from '../../src/modules/appointments/domain/services/AppointmentService'
import { DrizzleAppointmentRepository } from '../../src/modules/appointments/infra/drizzle/DrizzleAppointmentRepository'
import { DrizzleResourceRepository } from '../../src/modules/resources/infra/drizzle/DrizzleResourceRepository'
import { DrizzleServiceRepository } from '../../src/modules/services/infra/drizzle/DrizzleServiceRepository'

// ------------------------------------------------------------------
// Setup — conexão dedicada ao banco de teste
// ------------------------------------------------------------------
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})

const db = drizzle(pool, { schema })

// ------------------------------------------------------------------
// Helpers de fixture
// ------------------------------------------------------------------
async function createResource(data: {
  name: string
  type: 'professional' | 'room' | 'equipment'
}) {
  const [resource] = await db.insert(schema.resources).values(data).returning()
  return resource
}

async function createService(name: string, durationMinutes: number) {
  const [service] = await db
    .insert(schema.services)
    .values({ name, durationMinutes })
    .returning()
  return service
}

async function linkServiceResource(serviceId: string, resourceId: string) {
  await db.insert(schema.serviceResources).values({ serviceId, resourceId })
}

async function createUser() {
  const [user] = await db
    .insert(schema.users)
    .values({
      email: `test-${Date.now()}@test.com`,
      passwordHash: 'hash',
      role: 'client',
    })
    .returning()
  return user
}

// ------------------------------------------------------------------
// Lifecycle
// ------------------------------------------------------------------

beforeEach(async () => {
  // Limpa em ordem por causa das FKs
  await db.delete(schema.appointmentResources)
  await db.delete(schema.appointments)
  await db.delete(schema.serviceResources)
  await db.delete(schema.services)
  await db.delete(schema.resources)
  await db.delete(schema.users)
})

afterAll(async () => {
  await pool.end()
})

// ------------------------------------------------------------------
// Testes
// ------------------------------------------------------------------
describe('Integration: AppointmentService', () => {
  let appointmentService: AppointmentService
  let appointmentRepository: DrizzleAppointmentRepository
  let serviceRepository: DrizzleServiceRepository

  beforeEach(() => {
    appointmentRepository = new DrizzleAppointmentRepository()
    serviceRepository = new DrizzleServiceRepository()
    appointmentService = new AppointmentService(
      appointmentRepository,
      serviceRepository,
    )
  })

  it('should create an appointment and link resources in the database', async () => {
    const user = await createUser()
    const professional = await createResource({
      name: 'Ana Paula',
      type: 'professional',
    })
    const room = await createResource({ name: 'Sala 1', type: 'room' })
    const service = await createService('Lash Designer', 120)
    await linkServiceResource(service.id, professional.id)
    await linkServiceResource(service.id, room.id)

    const result = await appointmentService.execute({
      userId: user.id,
      serviceId: service.id,
      startTime: '2026-06-01T10:00:00.000Z',
    })

    expect(result.id).toBeDefined()
    expect(new Date(result.startTime).toISOString()).toBe(
      '2026-06-01T10:00:00.000Z',
    )
    expect(new Date(result.endTime).toISOString()).toBe(
      '2026-06-01T12:00:00.000Z',
    )

    // Verifica se os recursos foram vinculados no banco
    const linked = await db
      .select()
      .from(schema.appointmentResources)
      .where(eq(schema.appointmentResources.appointmentId, result.id))

    expect(linked).toHaveLength(2)
  })

  it('should throw ConflictError when a resource is already booked', async () => {
    const user = await createUser()
    const professional = await createResource({
      name: 'Ana Paula',
      type: 'professional',
    })
    const service = await createService('Lash Designer', 120)
    await linkServiceResource(service.id, professional.id)

    // Cria o primeiro agendamento
    await appointmentService.execute({
      userId: user.id,
      serviceId: service.id,
      startTime: '2026-06-01T10:00:00.000Z',
    })

    // Tenta criar um segundo no mesmo horário com o mesmo recurso
    await expect(
      appointmentService.execute({
        userId: user.id,
        serviceId: service.id,
        startTime: '2026-06-01T10:00:00.000Z',
      }),
    ).rejects.toThrow(ConflictError)
  })

  it('should allow booking when cancelled appointment frees the resource', async () => {
    const user = await createUser()
    const professional = await createResource({
      name: 'Ana Paula',
      type: 'professional',
    })
    const service = await createService('Lash Designer', 120)
    await linkServiceResource(service.id, professional.id)

    // Cria e cancela o primeiro agendamento
    const first = await appointmentService.execute({
      userId: user.id,
      serviceId: service.id,
      startTime: '2026-06-01T10:00:00.000Z',
    })

    await appointmentRepository.update(first.id, { status: 'cancelled' })

    // Mesmo horário deve estar disponível agora
    const second = await appointmentService.execute({
      userId: user.id,
      serviceId: service.id,
      startTime: '2026-06-01T10:00:00.000Z',
    })

    expect(second.id).toBeDefined()
    expect(second.id).not.toBe(first.id)
  })

  it('should throw NotFoundError when service does not exist', async () => {
    const user = await createUser()

    await expect(
      appointmentService.execute({
        userId: user.id,
        serviceId: '00000000-0000-0000-0000-000000000000',
        startTime: '2026-06-01T10:00:00.000Z',
      }),
    ).rejects.toThrow(NotFoundError)
  })
})

describe('Integration: DrizzleServiceRepository', () => {
  it('should return resources linked to a service in findAll', async () => {
    const professional = await createResource({
      name: 'Carla',
      type: 'professional',
    })
    const room = await createResource({ name: 'Sala 2', type: 'room' })
    const service = await createService('Manicure', 60)
    await linkServiceResource(service.id, professional.id)
    await linkServiceResource(service.id, room.id)

    const serviceRepository = new DrizzleServiceRepository()
    const services = await serviceRepository.findAll()

    const found = services.find((s) => s.id === service.id)
    expect(found).toBeDefined()
    expect(found!.resources).toHaveLength(2)
    expect(found!.resources.map((r) => r.name)).toContain('Carla')
    expect(found!.resources.map((r) => r.name)).toContain('Sala 2')
  })

  it('should return empty resources array for service with no links', async () => {
    await createService('Serviço sem recursos', 30)

    const serviceRepository = new DrizzleServiceRepository()
    const services = await serviceRepository.findAll()

    const found = services.find((s) => s.name === 'Serviço sem recursos')
    expect(found).toBeDefined()
    expect(found!.resources).toHaveLength(0)
  })

  it('should create service with resource links atomically', async () => {
    const resource = await createResource({
      name: 'Kit Lash',
      type: 'equipment',
    })

    const serviceRepository = new DrizzleServiceRepository()
    const service = await serviceRepository.create({
      name: 'Lash Designer',
      durationMinutes: 120,
      resourceIds: [resource.id],
    })

    expect(service.id).toBeDefined()

    const links = await db
      .select()
      .from(schema.serviceResources)
      .where(eq(schema.serviceResources.serviceId, service.id))

    expect(links).toHaveLength(1)
    expect(links[0].resourceId).toBe(resource.id)
  })
})

describe('Integration: DrizzleResourceRepository', () => {
  it('should throw ConflictError when deleting resource linked to a service', async () => {
    const resource = await createResource({ name: 'Sala 1', type: 'room' })
    const service = await createService('Lash Designer', 120)
    await linkServiceResource(service.id, resource.id)

    const resourceRepository = new DrizzleResourceRepository()

    await expect(resourceRepository.delete(resource.id)).rejects.toThrow(
      ConflictError,
    )
  })

  it('should delete resource successfully when not linked to any service', async () => {
    const resource = await createResource({ name: 'Sala Livre', type: 'room' })

    const resourceRepository = new DrizzleResourceRepository()
    await expect(resourceRepository.delete(resource.id)).resolves.not.toThrow()

    const result = await db
      .select()
      .from(schema.resources)
      .where(eq(schema.resources.id, resource.id))

    expect(result).toHaveLength(0)
  })
})
