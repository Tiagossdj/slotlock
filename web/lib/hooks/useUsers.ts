import { useQuery } from '@tanstack/react-query'
import { apiFetch } from '@/lib/api'

interface User {
  id: string
  email: string
  role: string
}

export function useUsers() {
  return useQuery({
    queryKey: ['users'],
    queryFn: () => apiFetch<User[]>('/api/users'),
  })
}