import { pgTable, uuid, text, timestamp } from "drizzle-orm/pg-core";
import { users } from "./users";
import { services } from "./services";

export const appointments = pgTable("appointments", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id),
  serviceId: uuid("service_id")
    .notNull()
    .references(() => services.id),
  startTime: timestamp("start_time", {
    withTimezone: false,
    mode: "string",
  }).notNull(),
  endTime: timestamp("end_time", {
    withTimezone: false,
    mode: "string",
  }).notNull(),
  status: text("status").notNull().default("pending"), // 'pending' | 'confirmed' | 'cancelled'
  createdAt: timestamp("created_at", { mode: "string" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "string" }).defaultNow().notNull(),
});
