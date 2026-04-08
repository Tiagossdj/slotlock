import { useMutation } from '@tanstack/react-query'
import { useRouter, useSearchParams } from 'next/navigation'
import { apiFetch } from '../api'
import { setAuth, clearAuth } from '../auth'
import type { AuthResponse } from '../types'

interface LoginInput {
  email: string
  password: string
}

interface RegisterInput {
  email: string
  password: string
}

export function useLogin() {
  const router = useRouter()
  const searchParams = useSearchParams()

  return useMutation({
    mutationFn: (data: LoginInput) =>
      apiFetch<AuthResponse>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    onSuccess: ({ token, user }) => {
      setAuth(token, user)
      const redirect = searchParams.get('redirect')
      router.push(redirect ?? (user.role === 'admin' ? '/' : '/availability'))
    },
  })
}

export function useRegister() {
  const router = useRouter()

  return useMutation({
    mutationFn: (data: RegisterInput) =>
      apiFetch<AuthResponse>('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    onSuccess: ({ token, user }) => {
      setAuth(token, user)
      router.push('/availability')
    },
  })
}

export function useLogout() {
  const router = useRouter()

  return function logout() {
    clearAuth()
    router.push('/login')
  }
}