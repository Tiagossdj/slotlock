import { useMutation } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { apiFetch } from '../api'
import { setAuth, clearAuth } from '../auth'
import type { AuthResponse } from '../types'

interface LoginInput {
  email: string
  password: string
}

export function useLogin() {
  const router = useRouter()

  return useMutation({
    mutationFn: (data: LoginInput) =>
      apiFetch<AuthResponse>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    onSuccess: ({ token, user }) => {
      setAuth(token, user)
      router.push('/')
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