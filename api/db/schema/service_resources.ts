// db/schema/service_resources.ts
import { pgTable, uuid } from "drizzle-orm/pg-core";
import { services } from "./services";
import { resources } from "./resources";

export const serviceResources = pgTable("service_resources", {
  serviceId: uuid("service_id")
    .notNull()
    .references(() => services.id),
  resourceId: uuid("resource_id")
    .notNull()
    .references(() => resources.id),
});
