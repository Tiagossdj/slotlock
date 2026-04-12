import { eq } from 'drizzle-orm'
import { db } from '@/infra/database/db'
import { users } from '../../../../../db/schema'
import type {
  CreateUserData,
  UpdateUserData,
  User,
} from '../../domain/entities/User'
import type { IUserRepository } from '../../domain/repositories/IUserRepository'

function toDomain(row: typeof users.$inferSelect): User {
  return {
    id: row.id,
    email: row.email,
    passwordHash: row.passwordHash,
    role: row.role as User['role'],
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  }
}

export class DrizzleUserRepository implements IUserRepository {
  async findById(id: string): Promise<User | null> {
    const result = await db.select().from(users).where(eq(users.id, id))
    return result[0] ? toDomain(result[0]) : null
  }

  async findByEmail(email: string): Promise<User | null> {
    const result = await db.select().from(users).where(eq(users.email, email))
    return result[0] ? toDomain(result[0]) : null
  }

  async findAll(): Promise<User[]> {
    const result = await db.select().from(users)
    return result.map(toDomain)
  }

  async create(data: CreateUserData): Promise<User> {
    const result = await db.insert(users).values(data).returning()
    return toDomain(result[0])
  }

  async update(id: string, data: UpdateUserData): Promise<User> {
    const result = await db
      .update(users)
      .set({ ...data, updatedAt: new Date().toISOString() })
      .where(eq(users.id, id))
      .returning()
    return toDomain(result[0])
  }

  async delete(id: string): Promise<void> {
    await db.delete(users).where(eq(users.id, id))
  }
}
