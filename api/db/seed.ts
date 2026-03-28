import 'dotenv/config'
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

  // limpeza do banco na ordem correta
  await db.delete(schema.appointmentResources)
  await db.delete(schema.appointments)
  await db.delete(schema.serviceResources)
  await db.delete(schema.services)
  await db.delete(schema.resources)
  await db.delete(schema.users)

  console.log('🧹 Database cleared')

  // Resources
  const [professional, room, equipment] = await db
    .insert(schema.resources)
    .values([
      { name: 'Ana Paula', type: 'professional' },
      { name: 'Sala 1', type: 'room' },
      { name: 'Kit Lash', type: 'equipment' },
    ])
    .returning()

  console.log('✅ Resouces created')

  // Services
  const [lashService] = await db
    .insert(schema.services)
    .values([
      { name: 'Lash Designer', durationMinutes: 120 },
      { name: 'Manicure', durationMinutes: 60 },
    ])
    .returning()

  console.log('✅ Services created')

  // Service Resources — vincula recursos ao serviço
  await db.insert(schema.serviceResources).values([
    { serviceId: lashService.id, resourceId: professional.id },
    { serviceId: lashService.id, resourceId: room.id },
    { serviceId: lashService.id, resourceId: equipment.id },
  ])

  console.log('✅ Service resources linked')

  // Users
  const [client] = await db
    .insert(schema.users)
    .values([
      { email: 'client@email.com', role: 'client' },
      { email: 'admin@slotlock.com', role: 'admin' },
    ])
    .returning()

  console.log('✅ Users created')

  // Appointment de exemplo
  const startTime = '2026-06-01T10:00:00.000Z'
  const endTime = '2026-06-01T12:00:00.000Z'

  const [appointment] = await db
    .insert(schema.appointments)
    .values({
      userId: client.id,
      serviceId: lashService.id,
      startTime,
      endTime,
      status: 'confirmed',
    })
    .returning()

  // Appointment resources
  await db.insert(schema.appointmentResources).values([
    { appointmentId: appointment.id, resourceId: professional.id },
    { appointmentId: appointment.id, resourceId: room.id },
    { appointmentId: appointment.id, resourceId: equipment.id },
  ])

  console.log('✅ Appointment created')

  console.log('🎉 Seed completed!')

  await pool.end()
}

seed().catch((err) => {
  console.error('seed failed:', err)
  pool.end()
  process.exit(1)
})
