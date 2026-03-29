"use client";

import { useState } from "react";
import {
  useAppointments,
  useCreateAppointment,
  useUpdateAppointmentStatus,
  useDeleteAppointment,
} from "@/lib/hooks/useAppointments";
import { useServices } from "@/lib/hooks/useServices";
import { useUsers } from "@/lib/hooks/useUsers";
import { Plus, Trash2 } from "lucide-react";
import type { Appointment } from "@/lib/types";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { toast } from "sonner";

const statusColors = {
  pending: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  confirmed: "bg-green-500/20 text-green-400 border-green-500/30",
  cancelled: "bg-red-500/20 text-red-400 border-red-500/30",
};

export default function AppointmentsPage() {
  const { data: appointments, isLoading } = useAppointments();
  const { data: services } = useServices();
  const { data: users } = useUsers();
  const { mutate: createAppointment, isPending: isCreating } =
    useCreateAppointment();
  const { mutate: updateStatus } = useUpdateAppointmentStatus();
  const { mutate: deleteAppointment, isPending: isDeleting } =
    useDeleteAppointment();

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    userId: "",
    serviceId: "",
    startTime: "",
  });
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const getUserEmail = (userId: string) =>
    users?.find((u) => u.id === userId)?.email ?? userId;

  const getServiceName = (serviceId: string) =>
    services?.find((s) => s.id === serviceId)?.name ?? serviceId;

  const handleSubmit = () => {
    if (!form.userId || !form.serviceId || !form.startTime) return;

    // converte datetime-local para UTC ISO string
    const startTimeUTC = new Date(form.startTime).toISOString();

    createAppointment(
      { ...form, startTime: startTimeUTC },
      {
        onSuccess: () => {
          setForm({ userId: "", serviceId: "", startTime: "" });
          setShowForm(false);
          toast.success("Appointment created successfully!");
        },
        onError: (err) => toast.error(err.message),
      },
    );
  };

  const handleStatusChange = (id: string, status: Appointment["status"]) => {
    updateStatus(
      { id, status },
      {
        onSuccess: () => toast.success("Status updated"),
        onError: (err) => toast.error(err.message),
      },
    );
  };

  const handleDelete = () => {
    if (!deleteId) return;
    deleteAppointment(deleteId, {
      onSuccess: () => {
        setDeleteId(null);
        toast.success("Appointment deleted");
      },
      onError: (err) => {
        setDeleteId(null);
        toast.error(err.message);
      },
    });
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Appointments</h1>
          <p className="text-muted-foreground mt-1">
            Manage and track all bookings
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm font-medium hover:opacity-90 transition-opacity w-full sm:w-auto justify-center"
        >
          <Plus size={16} />
          New Appointment
        </button>
      </div>

      {showForm && (
        <div className="bg-card border border-border rounded-lg p-6 space-y-4">
          <h2 className="text-lg font-semibold text-foreground">
            New Appointment
          </h2>
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm text-muted-foreground">User</label>
              <select
                value={form.userId}
                onChange={(e) => setForm({ ...form, userId: e.target.value })}
                className="w-full bg-input border border-border rounded-md px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
              >
                <option value="">Select a user</option>
                {users?.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.email}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm text-muted-foreground">Service</label>
              <select
                value={form.serviceId}
                onChange={(e) =>
                  setForm({ ...form, serviceId: e.target.value })
                }
                className="w-full bg-input border border-border rounded-md px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
              >
                <option value="">Select a service</option>
                {services?.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm text-muted-foreground">
                Date & Time
              </label>
              <input
                type="datetime-local"
                value={form.startTime}
                onChange={(e) =>
                  setForm({ ...form, startTime: e.target.value })
                }
                className="w-full bg-input border border-border rounded-md px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
              />
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleSubmit}
              disabled={isCreating}
              className="bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {isCreating ? "Creating..." : "Create Appointment"}
            </button>
            <button
              onClick={() => setShowForm(false)}
              className="bg-secondary text-secondary-foreground px-4 py-2 rounded-md text-sm font-medium hover:opacity-90 transition-opacity"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

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
          <p className="text-muted-foreground">No appointments yet</p>
        </div>
      ) : (
        <div className="space-y-4">
          {appointments?.map((apt) => (
            <div
              key={apt.id}
              className="bg-card border border-border rounded-lg p-6 group"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="font-semibold text-foreground">
                    {getUserEmail(apt.userId)}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className={`text-xs px-2.5 py-1 rounded-full border font-medium ${statusColors[apt.status]}`}
                  >
                    {apt.status}
                  </span>
                  <button
                    onClick={() => setDeleteId(apt.id)}
                    className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-all"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Service</p>
                  <p className="text-sm text-foreground">
                    {getServiceName(apt.serviceId)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">
                    Date & Time
                  </p>
                  <p className="text-sm text-foreground">
                    {new Date(apt.startTime).toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-4 border-t border-border">
                <select
                  value={apt.status}
                  onChange={(e) =>
                    handleStatusChange(
                      apt.id,
                      e.target.value as Appointment["status"],
                    )
                  }
                  className="bg-secondary border border-border rounded-md px-3 py-1.5 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                >
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
                <span className="text-xs text-muted-foreground">
                  Change appointment status
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete Appointment"
        description="Are you sure you want to delete this appointment? This action cannot be undone."
        isPending={isDeleting}
      />
    </div>
  );
}
