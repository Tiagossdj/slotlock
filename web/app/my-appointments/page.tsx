'use client'

import { useAppointments, useUpdateAppointmentStatus } from '@/lib/hooks/useAppointments'
import { useServices } from '@/lib/hooks/useServices'
import Link from 'next/link'
import { toast } from 'sonner'

const statusColors = {
  pending: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  confirmed: 'bg-green-500/20 text-green-400 border-green-500/30',
  cancelled: 'bg-red-500/20 text-red-400 border-red-500/30',
}

export default function MyAppointmentsPage() {
  const { data: appointments, isLoading } = useAppointments()
  const { data: services } = useServices()
  const { mutate: updateStatus } = useUpdateAppointmentStatus()

  const getServiceName = (serviceId: string) =>
    services?.find((s) => s.id === serviceId)?.name ?? serviceId

  const handleCancel = (id: string) => {
    updateStatus(
      { id, status: 'cancelled' },
      {
        onSuccess: () => toast.success('Agendamento cancelado'),
        onError: (err) => toast.error(err.message),
      },
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Meus Agendamentos</h1>
        <p className="text-muted-foreground mt-1">
          Visualize e gerencie seus agendamentos
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-card border border-border rounded-lg p-6 animate-pulse h-32"
            />
          ))}
        </div>
      ) : appointments?.length === 0 ? (
        <div className="bg-card border border-border rounded-lg p-12 text-center">
          <p className="text-muted-foreground">Você ainda não tem agendamentos</p>
          <Link
            href="/availability"
            className="inline-block mt-4 text-sm text-primary hover:underline"
          >
            Ver horários disponíveis
            </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {appointments?.map((apt) => (
            <div
              key={apt.id}
              className="bg-card border border-border rounded-lg p-6"
            >
              <div className="flex items-start justify-between mb-4">
                <p className="font-semibold text-foreground">
                  {getServiceName(apt.serviceId)}
                </p>
                <span
                  className={`text-xs px-2.5 py-1 rounded-full border font-medium ${statusColors[apt.status]}`}
                >
                  {apt.status}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Data & Hora</p>
                  <p className="text-sm text-foreground">
                    {new Date(apt.startTime).toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Término</p>
                  <p className="text-sm text-foreground">
                    {new Date(apt.endTime).toLocaleString()}
                  </p>
                </div>
              </div>

              {apt.status !== 'cancelled' && (
                <div className="pt-4 border-t border-border">
                  <button
                    onClick={() => handleCancel(apt.id)}
                    className="text-sm text-destructive hover:underline"
                  >
                    Cancelar agendamento
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}