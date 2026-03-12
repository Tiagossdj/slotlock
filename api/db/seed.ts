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

  // Resources
  const [_professional, _room, _equipment] = await db
    .insert(schema.resources)
    .values([
      { name: 'Ana Paula', type: 'professional' },
      { name: 'Sala 1', type: 'room' },
      { name: 'Kit Lash', type: 'equipment' },
    ])
    .returning()

  console.log('✅ Resouces created')

  // Services
  const [_lashService] = await db
    .insert(schema.services)
    .values([
      { name: 'Lash Designer', durationMinutes: 120 },
      { name: 'Manicure', durationMinutes: 60 },
    ])
    .returning()

  console.log('✅ Service resources linked')

  // User
  await db.insert(schema.users).values([
    { email: 'client@email.com', role: 'client' },
    { email: 'admin@slotlock.com', role: 'admin' },
  ])

  console.log('✅ Users created')
  console.log('🎉 Seed completed!')

  await pool.end()
}

seed().catch((err) => {
  console.error('seed failed:', err)
  pool.end()
  process.exit(1)
})
