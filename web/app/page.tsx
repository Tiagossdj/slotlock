"use client";

import { useAppointments } from "@/lib/hooks/useAppointments";
import { useResources } from "@/lib/hooks/useResources";
import { useServices } from "@/lib/hooks/useServices";
import { Calendar, Clock, Users, Briefcase } from "lucide-react";

const statusColors = {
  pending: "bg-yellow-500/20 text-yellow-400",
  confirmed: "bg-green-500/20 text-green-400",
  cancelled: "bg-red-500/20 text-red-400",
};

export default function DashboardPage() {
  const { data: appointments } = useAppointments();
  const { data: resources } = useResources();
  const { data: services } = useServices();

  const today = new Date().toDateString();
  const todayBookings =
    appointments?.filter((a) => new Date(a.startTime).toDateString() === today)
      .length ?? 0;

  const stats = [
    {
      label: "Total Resources",
      value: resources?.length ?? 0,
      icon: Users,
      color: "text-blue-400",
    },
    {
      label: "Active Services",
      value: services?.length ?? 0,
      icon: Briefcase,
      color: "text-green-400",
    },
    {
      label: "Total Appointments",
      value: appointments?.length ?? 0,
      icon: Calendar,
      color: "text-purple-400",
    },
    {
      label: "Today's Bookings",
      value: todayBookings,
      icon: Clock,
      color: "text-primary",
    },
  ];

  const recentAppointments = appointments?.slice(0, 5) ?? [];

  const resourceOverview = {
    professional:
      resources?.filter((r) => r.type === "professional").length ?? 0,
    room: resources?.filter((r) => r.type === "room").length ?? 0,
    equipment: resources?.filter((r) => r.type === "equipment").length ?? 0,
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Welcome to SlotLock - Resource-aware scheduling system
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="bg-card border border-border rounded-lg p-5"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-muted-foreground">
                  {stat.label}
                </span>
                <Icon size={20} className={stat.color} />
              </div>
              <p className="text-3xl font-bold text-foreground">{stat.value}</p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Recent Appointments */}
        <div className="col-span-2 bg-card border border-border rounded-lg p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">
            Recent Appointments
          </h2>
          <div className="space-y-3">
            {recentAppointments.length === 0 ? (
              <p className="text-muted-foreground text-sm">
                No appointments yet
              </p>
            ) : (
              recentAppointments.map((apt) => (
                <div
                  key={apt.id}
                  className="flex items-center justify-between py-3 border-b border-border last:border-0"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-1 h-10 bg-primary rounded-full" />
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {apt.userId}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(apt.startTime).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`text-xs px-2.5 py-1 rounded-full font-medium ${statusColors[apt.status]}`}
                  >
                    {apt.status}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Resources Overview */}
        <div className="bg-card border border-border rounded-lg p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">
            Resources Overview
          </h2>
          <div className="space-y-4">
            {[
              { label: "Professionals", value: resourceOverview.professional },
              { label: "Rooms", value: resourceOverview.room },
              { label: "Equipments", value: resourceOverview.equipment },
            ].map((item) => (
              <div
                key={item.label}
                className="flex items-center justify-between"
              >
                <span className="text-sm text-muted-foreground">
                  {item.label}
                </span>
                <span className="text-sm font-semibold text-foreground">
                  {item.value}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-6 pt-4 border-t border-border">
            <h3 className="text-sm font-medium text-foreground mb-3">
              About SlotLock
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              A resource-aware scheduling API that prevents double booking by
              validating multiple resources simultaneously using pessimistic
              locking.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
