"use client";

import { useState } from "react";
import {
  useServices,
  useCreateService,
  useDeleteService,
} from "@/lib/hooks/useServices";
import { Plus, Trash2, Clock } from "lucide-react";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

export default function ServicesPage() {
  const { data: services, isLoading } = useServices();
  const { mutate: createService, isPending: isCreating } = useCreateService();
  const { mutate: deleteService, isPending: isDeleting } = useDeleteService();

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", durationMinutes: 60 });
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const handleSubmit = () => {
    if (!form.name.trim()) return;
    createService(form, {
      onSuccess: () => {
        setForm({ name: "", durationMinutes: 60 });
        setShowForm(false);
      },
    });
  };

  const handleDelete = () => {
    if (!deleteId) return;
    deleteService(deleteId, {
      onSuccess: () => setDeleteId(null),
    });
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Services</h1>
          <p className="text-muted-foreground mt-1">
            Manage bookable services and their resource requirements
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm font-medium hover:opacity-90 transition-opacity"
        >
          <Plus size={16} />
          Add Service
        </button>
      </div>

      {showForm && (
        <div className="bg-card border border-border rounded-lg p-6 space-y-4">
          <h2 className="text-lg font-semibold text-foreground">New Service</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm text-muted-foreground">Name</label>
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Ex: Lash Designer"
                className="w-full bg-input border border-border rounded-md px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm text-muted-foreground">
                Duration (minutes)
              </label>
              <input
                type="number"
                value={form.durationMinutes}
                onChange={(e) =>
                  setForm({ ...form, durationMinutes: Number(e.target.value) })
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
              {isCreating ? "Creating..." : "Create Service"}
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
        <div className="grid grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-card border border-border rounded-lg p-5 animate-pulse h-36"
            />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-4">
          {services?.map((service) => (
            <div
              key={service.id}
              className="bg-card border border-border rounded-lg p-5 group"
            >
              <div className="flex items-start justify-between mb-3">
                <h3 className="font-semibold text-foreground">
                  {service.name}
                </h3>
                <button
                  onClick={() => setDeleteId(service.id)}
                  className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-all"
                >
                  <Trash2 size={14} />
                </button>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock size={14} />
                <span className="text-sm">{service.durationMinutes} min</span>
              </div>
              <p className="text-xs text-muted-foreground mt-3">
                Created: {new Date(service.createdAt).toLocaleDateString()}
              </p>
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete Resource"
        description="Are you sure you want to delete this resource? This action cannot be undone."
        isPending={isDeleting}
      />
    </div>
  );
}
