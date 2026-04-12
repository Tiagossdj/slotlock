import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
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
  const router = useRouter()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: LoginInput) =>
      apiFetch<{ user: User }>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    onSuccess: ({ user }) => {
      setAuth(user) // salva só os dados, sem token
      queryClient.setQueryData(['me'], user) // evita refetch desnecessário
      router.push(user.role === 'admin' ? '/' : '/availability')
    },
  })
}

export function useRegister() {
  const router = useRouter()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: RegisterInput) =>
      apiFetch<{ user: User }>('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    onSuccess: ({ user }) => {
      setAuth(user)
      queryClient.setQueryData(['me'], user)
      router.push('/availability')
    },
  })
}

export function useLogout() {
  const queryClient = useQueryClient()

  return async function logout() {
    await apiFetch('/api/auth/logout', { method: 'POST', body: JSON.stringify({}) }).catch(() => {})
    clearAuth()
    queryClient.clear() 
    window.location.href = '/login'
  }
}