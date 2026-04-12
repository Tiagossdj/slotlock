import type { FastifyInstance } from 'fastify'
import { ConflictError } from '@/core/errors/ConflictError'
import { NotFoundError } from '@/core/errors/NotFoundError'
import type { PublicUser } from '../../../users/domain/entities/User'
import type { IUserRepository } from '../../../users/domain/repositories/IUserRepository'
import type { AuthService } from '../../domain/services/AuthService'

interface RegisterInput {
  email: string
  password: string
  role?: 'client' | 'admin'
}

interface LoginInput {
  email: string
  password: string
}

export class AuthController {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly authService: AuthService,
    private readonly app: FastifyInstance,
  ) {}

  async register(
    input: RegisterInput,
  ): Promise<{ token: string; user: PublicUser }> {
    const existing = await this.userRepository.findByEmail(input.email)
    if (existing) throw new ConflictError('Email already in use')

    const passwordHash = await this.authService.hashPassword(input.password)

    const user = await this.userRepository.create({
      email: input.email,
      passwordHash,
      role: input.role ?? 'client',
    })

    const token = this.app.jwt.sign({
      sub: user.id,
      email: user.email,
      role: user.role,
    })

    const { passwordHash: _, ...publicUser } = user

    return { token, user: publicUser }
  }

  async login(input: LoginInput): Promise<{ token: string; user: PublicUser }> {
    const user = await this.userRepository.findByEmail(input.email)
    if (!user) throw new NotFoundError('Invalid credentials')

    const valid = await this.authService.comparePassword(
      input.password,
      user.passwordHash,
    )
    if (!valid) throw new NotFoundError('Invalid credentials')

    const token = this.app.jwt.sign({
      sub: user.id,
      email: user.email,
      role: user.role,
    })

    const { passwordHash: _, ...publicUser } = user

    return { token, user: publicUser }
  }

  async me(userId: string): Promise<PublicUser> {
    const user = await this.userRepository.findById(userId)
    if (!user) throw new NotFoundError('User not found')

    const { passwordHash: _, ...publicUser } = user

    return publicUser
  }
}
