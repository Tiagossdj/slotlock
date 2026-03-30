import bcrypt from 'bcrypt'

const SALT_ROUNDS = 10

export class AuthService {
  async hashPassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash)
  }
}
