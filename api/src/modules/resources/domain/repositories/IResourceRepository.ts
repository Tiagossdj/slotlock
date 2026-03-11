import type { resources } from "../../../../../db/schema";
import type { InferSelectModel, InferInsertModel } from "drizzle-orm";

export type Resource = InferSelectModel<typeof resources>;
export type NewResource = InferInsertModel<typeof resources>;

export interface IResourceRepository {
  findById(id: string): Promise<Resource | null>;
  findAll(): Promise<Resource[]>;
  findByIds(ids: string[]): Promise<Resource[]>;
  create(data: NewResource): Promise<Resource>;
  update(id: string, data: Partial<NewResource>): Promise<Resource>;
  delete(id: string): Promise<void>;
}
