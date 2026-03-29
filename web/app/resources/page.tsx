"use client";

import { useState } from "react";
import {
  useResources,
  useCreateResource,
  useDeleteResource,
} from "@/lib/hooks/useResources";
import { Plus, Trash2 } from "lucide-react";
import type { Resource } from "@/lib/types";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { toast } from "sonner";

const typeColors = {
  professional: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  room: "bg-green-500/20 text-green-400 border-green-500/30",
  equipment: "bg-purple-500/20 text-purple-400 border-purple-500/30",
};

export default function ResourcesPage() {
  const { data: resources, isLoading } = useResources();
  const { mutate: createResource, isPending: isCreating } = useCreateResource();
  const { mutate: deleteResource, isPending: isDeleting } = useDeleteResource();

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    name: "",
    type: "professional" as Resource["type"],
  });
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const handleSubmit = () => {
    if (!form.name.trim()) return
    createResource(form, {
      onSuccess: () => {
        setForm({ name: '', type: 'professional' })
        setShowForm(false)
        toast.success('Resource created successfully!')
      },
      onError: (err) => toast.error(err.message),
    })
  }

  const handleDelete = () => {
    if (!deleteId) return;
    deleteResource(deleteId, {
      onSuccess: () => {
        setDeleteId(null);
        toast.success("Resource deleted successfully");
      },
      onError: (err) => {
        setDeleteId(null);
        toast.error(err.message);
      },
    });
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Resources</h1>
          <p className="text-muted-foreground mt-1">
            Manage professionals, rooms, and equipment
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm font-medium hover:opacity-90 transition-opacity"
        >
          <Plus size={16} />
          Add Resource
        </button>
      </div>

      {showForm && (
        <div className="bg-card border border-border rounded-lg p-6 space-y-4">
          <h2 className="text-lg font-semibold text-foreground">
            New Resource
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm text-muted-foreground">Name</label>
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Ex: Ana Paula"
                className="w-full bg-input border border-border rounded-md px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm text-muted-foreground">Type</label>
              <select
                value={form.type}
                onChange={(e) =>
                  setForm({ ...form, type: e.target.value as Resource["type"] })
                }
                className="w-full bg-input border border-border rounded-md px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
              >
                <option value="professional">Professional</option>
                <option value="room">Room</option>
                <option value="equipment">Equipment</option>
              </select>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleSubmit}
              disabled={isCreating}
              className="bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {isCreating ? "Creating..." : "Create Resource"}
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-card border border-border rounded-lg p-5 animate-pulse h-32"
            />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {resources?.map((resource) => (
            <div
              key={resource.id}
              className="bg-card border border-border rounded-lg p-5 group"
            >
              <div className="flex items-start justify-between mb-3">
                <h3 className="font-semibold text-foreground">
                  {resource.name}
                </h3>
                <div className="flex items-center gap-2">
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full border font-medium ${typeColors[resource.type]}`}
                  >
                    {resource.type}
                  </span>
                  <button
                    onClick={() => setDeleteId(resource.id)}
                    className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-all"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                Created: {new Date(resource.createdAt).toLocaleDateString()}
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
