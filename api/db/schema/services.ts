import { integer, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'

export const services = pgTable('services', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  durationMinutes: integer('duration_minutes').notNull(),
  createdAt: timestamp('created_at', { mode: 'string' }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { mode: 'string' }).defaultNow().notNull(),
})
