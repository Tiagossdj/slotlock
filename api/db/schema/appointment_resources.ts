import { pgTable, uuid } from 'drizzle-orm/pg-core'
import { appointments } from './appointments'
import { resources } from './resources'

export const appointmentResources = pgTable('appointment_resources', {
  appointmentId: uuid('appointment_id').notNull().references(() => appointments.id),
  resourceId: uuid('resource_id').notNull().references(() => resources.id),
})