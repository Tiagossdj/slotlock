import 'dotenv/config'
import bcrypt from 'bcrypt'
import { drizzle } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'
import { env } from '../src/config/env'
import * as schema from './schema'

const pool = new Pool({
  connectionString: env.DATABASE_URL,
})

const db = drizzle(pool, { schema })

async function seed() {
  console.log('🌱 Seeding database...')

  // limpeza
  await db.delete(schema.appointmentResources)
  await db.delete(schema.appointments)
  await db.delete(schema.serviceResources)
  await db.delete(schema.services)
  await db.delete(schema.resources)
  await db.delete(schema.users)

  console.log('🧹 Database cleared')

  // Resources
  const [professional, room, equipment, professional2, room2, equipment2] =
    await db
      .insert(schema.resources)
      .values([
        { name: 'Ana Paula', type: 'professional' },
        { name: 'Sala 1', type: 'room' },
        { name: 'Kit Lash', type: 'equipment' },
        { name: 'Carla', type: 'professional' },
        { name: 'Sala 2', type: 'room' },
        { name: 'Kit Manicure', type: 'equipment' },
      ])
      .returning()

  console.log('✅ Resources created')

  // Services
  const [lashService, manicureService] = await db
    .insert(schema.services)
    .values([
      { name: 'Lash Designer', durationMinutes: 120 },
      { name: 'Manicure', durationMinutes: 60 },
    ])
    .returning()

  console.log('✅ Services created')

  // Service Resources
  await db.insert(schema.serviceResources).values([
    { serviceId: lashService.id, resourceId: professional.id },
    { serviceId: lashService.id, resourceId: room.id },
    { serviceId: lashService.id, resourceId: equipment.id },
    { serviceId: manicureService.id, resourceId: professional2.id },
    { serviceId: manicureService.id, resourceId: room2.id },
    { serviceId: manicureService.id, resourceId: equipment2.id },
  ])

  console.log('✅ Service resources linked')

  // Users
  const clientHash = await bcrypt.hash('client@03', 10)
  const adminHash = await bcrypt.hash('admin123', 10)

  const [client] = await db
    .insert(schema.users)
    .values([
      { email: 'client@email.com', role: 'client', passwordHash: clientHash },
      { email: 'admin@slotlock.com', role: 'admin', passwordHash: adminHash },
    ])
    .returning()

  console.log('✅ Users created')

  // Appointments de exemplo
  // Lash Designer — 10:00 local = 13:00 UTC
  const [lashAppointment] = await db
    .insert(schema.appointments)
    .values({
      userId: client.id,
      serviceId: lashService.id,
      startTime: '2026-06-01T13:00:00.000Z',
      endTime: '2026-06-01T15:00:00.000Z',
      status: 'confirmed',
    })
    .returning()

  await db.insert(schema.appointmentResources).values([
    { appointmentId: lashAppointment.id, resourceId: professional.id },
    { appointmentId: lashAppointment.id, resourceId: room.id },
    { appointmentId: lashAppointment.id, resourceId: equipment.id },
  ])

  // Manicure — 14:00 local = 17:00 UTC
  const [manicureAppointment] = await db
    .insert(schema.appointments)
    .values({
      userId: client.id,
      serviceId: manicureService.id,
      startTime: '2026-06-01T17:00:00.000Z',
      endTime: '2026-06-01T18:00:00.000Z',
      status: 'confirmed',
    })
    .returning()

  await db.insert(schema.appointmentResources).values([
    { appointmentId: manicureAppointment.id, resourceId: professional2.id },
    { appointmentId: manicureAppointment.id, resourceId: room2.id },
    { appointmentId: manicureAppointment.id, resourceId: equipment2.id },
  ])

  console.log('✅ Appointments created')
  console.log('🎉 Seed completed!')

  await pool.end()
}

seed().catch((err) => {
  console.error('seed failed:', err)
  pool.end()
  process.exit(1)
})
