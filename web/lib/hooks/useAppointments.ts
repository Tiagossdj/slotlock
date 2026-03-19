import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiFetch } from '@/lib/api'
import type { Appointment, AvailableSlot } from '@/lib/types'

export function useAppointments() {
  return useQuery({
    queryKey: ['appointments'],
    queryFn: () => apiFetch<Appointment[]>('/api/appointments'),
  })
}

export function useAppointment(id: string) {
  return useQuery({
    queryKey: ['appointments', id],
    queryFn: () => apiFetch<Appointment>(`/api/appointments/${id}`),
    enabled: !!id,
  })
}

export function useCreateAppointment() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: { userId: string; serviceId: string; startTime: string }) =>
      apiFetch<Appointment>('/api/appointments', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] })
    },
  })
}

export function useUpdateAppointmentStatus() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: Appointment['status'] }) =>
      apiFetch<Appointment>(`/api/appointments/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ status }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] })
    },
  })
}

export function useDeleteAppointment() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) =>
      apiFetch(`/api/appointments/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] })
    },
  })
}

export function useAvailability(serviceId: string, date: string) {
  return useQuery({
    queryKey: ['availability', serviceId, date],
    queryFn: () =>
      apiFetch<AvailableSlot[]>(`/api/availability?serviceId=${serviceId}&date=${date}`),
    enabled: !!serviceId && !!date,
  })
}