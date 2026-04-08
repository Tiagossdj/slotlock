import type { User } from './types'

const TOKEN_KEY = 'slotlock:token'
const USER_KEY = 'slotlock:user'

// NOTE: localStorage is used for simplicity. In production,
// prefer httpOnly cookies to mitigate XSS risks.

export function getToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(TOKEN_KEY)
}

export function getUser(): User | null {
  if (typeof window === 'undefined') return null
  const raw = localStorage.getItem(USER_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw) as User
  } catch {
    return null
  }
}

export function setAuth(token: string, user: User): void {
  localStorage.setItem(TOKEN_KEY, token)
  localStorage.setItem(USER_KEY, JSON.stringify(user))
  // cookie apenas para o middleware conseguir verificar autenticação
  document.cookie = `${TOKEN_KEY}=${token}; path=/; SameSite=Strict`
}

export function clearAuth(): void {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(USER_KEY)
  document.cookie = `${TOKEN_KEY}=; path=/; max-age=0`
}

export function isAuthenticated(): boolean {
  return !!getToken()
}