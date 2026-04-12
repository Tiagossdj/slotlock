export interface User {
  id: string
  email: string
  passwordHash: string
  role: 'client' | 'admin'
  createdAt: string
  updatedAt: string
}

export type CreateUserData = Omit<User, 'id' | 'createdAt' | 'updatedAt'>
export type UpdateUserData = Partial<CreateUserData>

export type PublicUser = Omit<User, 'passwordHash'>
