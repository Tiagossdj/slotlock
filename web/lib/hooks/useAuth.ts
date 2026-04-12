import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { apiFetch } from '../api'
import { setAuth, clearAuth } from '../auth'
import type { User } from '../types'

interface LoginInput { email: string; password: string }
interface RegisterInput { email: string; password: string }

export function useMe() {
  return useQuery({
    queryKey: ['me'],
    queryFn: () => apiFetch<User>('/api/auth/me'),
    staleTime: 1000 * 60 * 5,
    retry: false,
  })
}

export function useLogin() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: LoginInput) =>
      apiFetch<{ user: User; token: string }>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    onSuccess: ({ user, token }) => {
      localStorage.setItem('slotlock_token', token)
      setAuth(user)
      queryClient.setQueryData(['me'], user)
    },
  })
}

export function useRegister() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: RegisterInput) =>
      apiFetch<{ user: User; token: string }>('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    onSuccess: ({ user, token }) => {
      localStorage.setItem('slotlock_token', token)
      setAuth(user)
      queryClient.setQueryData(['me'], user)
    },
  })
}

export function useLogout() {
  const queryClient = useQueryClient()

  return async function logout() {
    await apiFetch('/api/auth/logout', { method: 'POST', body: JSON.stringify({}) }).catch(() => {})
    localStorage.removeItem('slotlock_token') // ← limpa o localStorage
    clearAuth()
    queryClient.clear()
    window.location.href = '/login'
  }
}