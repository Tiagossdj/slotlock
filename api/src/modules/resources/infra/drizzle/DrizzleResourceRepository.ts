import { eq, inArray } from "drizzle-orm";
import { db } from "../../../../infra/database/db";
import { resources } from "../../../../../db/schema";
import type {
  IResourceRepository,
  Resource,
  NewResource,
} from "../../domain/repositories/IResourceRepository";

export class DrizzleResourceRepository implements IResourceRepository {
  async findById(id: string): Promise<Resource | null> {
    const result = await db
      .select()
      .from(resources)
      .where(eq(resources.id, id));

    return result[0] ?? null;
  }

  async findAll(): Promise<Resource[]> {
    return await db.select().from(resources);
  }

  async findByIds(ids: string[]): Promise<Resource[]> {
    return await db.select().from(resources).where(inArray(resources.id, ids));
  }

  async create(data: NewResource): Promise<Resource> {
    const result = await db.insert(resources).values(data).returning();

    return result[0];
  }

  async update(id: string, data: Partial<NewResource>): Promise<Resource> {
    const result = await db
      .update(resources)
      .set({ ...data, updatedAt: new Date().toISOString() })
      .where(eq(resources.id, id))
      .returning();

    return result[0];
  }

  async delete(id: string): Promise<void> {
    await db.delete(resources).where(eq(resources.id, id));
  }
}
