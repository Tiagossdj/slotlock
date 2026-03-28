"use client";
import { useUsers } from "@/lib/hooks/useUsers";
import { useState } from "react";
import { useServices } from "@/lib/hooks/useServices";
import {
  useAvailability,
  useCreateAppointment,
} from "@/lib/hooks/useAppointments";
import { Search, Clock, Calendar } from "lucide-react";
import { toast } from "sonner";

export default function AvailabilityPage() {
  const { data: services } = useServices();
  const {data: users} = useUsers()
  const clientUser = users?.find(u => u.role = 'client')
  const [serviceId, setServiceId] = useState("");
  const [date, setDate] = useState("");
  const [searched, setSearched] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);

  const { data: slots, isLoading, refetch } = useAvailability(serviceId, date);
  const { mutate: createAppointment, isPending: isBooking } =
    useCreateAppointment();

  const selectedService = services?.find((s) => s.id === serviceId);

  const handleSearch = () => {
    if (!serviceId || !date) return;
    setSearched(true);
    setSelectedSlot(null);
    refetch()
  }

  const handleBook = (startTime: string) => {
    createAppointment(
      {
        userId: clientUser?.id ??'', 
        serviceId,
        startTime,
      },
      {
        onSuccess: () => {
          toast.success("Appointment booked successfully!");
          setSelectedSlot(null);
          refetch()
        },
        onError: (err) => toast.error(err.message),
      },
    );
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Availability</h1>
        <p className="text-muted-foreground mt-1">
          Check available time slots for services
        </p>
      </div>

      {/* Search */}
      <div className="bg-card border border-border rounded-lg p-6 space-y-4">
        <h2 className="text-lg font-semibold text-foreground">
          Search Available Slots
        </h2>
        <div className="flex gap-4">
          <div className="flex-1 space-y-1.5">
            <label className="text-sm text-muted-foreground">Service</label>
            <select
              value={serviceId}
              onChange={(e) => setServiceId(e.target.value)}
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
          <div className="flex-1 space-y-1.5">
            <label className="text-sm text-muted-foreground">Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full bg-input border border-border rounded-md px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={handleSearch}
              disabled={!serviceId || !date}
              className="flex items-center gap-2 bg-primary text-primary-foreground px-6 py-2 rounded-md text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              <Search size={16} />
              Search Slots
            </button>
          </div>
        </div>

        {selectedService && (
          <div className="bg-secondary rounded-md p-4 space-y-1">
            <p className="text-sm font-medium text-foreground">
              Selected Service Details
            </p>
            <div className="flex gap-6 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <Clock size={14} />
                Duration: {selectedService.durationMinutes} minutes
              </span>
              <span className="flex items-center gap-1.5">
                <Calendar size={14} />
                Resources needed: linked to this service
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Results */}
      {searched && (
        <div className="bg-card border border-border rounded-lg p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">
            Available Slots
          </h2>

          {isLoading ? (
            <div className="grid grid-cols-4 gap-3">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="bg-secondary rounded-md p-4 animate-pulse h-16"
                />
              ))}
            </div>
          ) : slots?.length === 0 ? (
            <p className="text-muted-foreground text-sm">
              No available slots for this date.
            </p>
          ) : (
            <div className="grid grid-cols-4 gap-3">
              {slots?.map((slot) => (
                <button
                  key={slot.startTime}
                  onClick={() =>
                    slot.available ? setSelectedSlot(slot.startTime) : null
                  }
                  disabled={!slot.available}
                  className={`p-4 rounded-md border text-sm transition-all ${
                    !slot.available
                      ? "bg-secondary/50 text-muted-foreground border-border opacity-50 cursor-not-allowed"
                      : selectedSlot === slot.startTime
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-secondary text-foreground border-border hover:border-primary cursor-pointer"
                  }`}
                >
                  <p className="font-medium">
                    {new Date(slot.startTime).toLocaleTimeString('pt-br', {
                      hour: "2-digit",
                      minute: "2-digit",
                      timeZone: 'America/Sao_Paulo'                    
                      })}
                  </p>
                  <p className="text-xs opacity-70 mt-0.5">
                    {!slot.available
                      ? "unavailable"
                      : `até ${new Date(slot.endTime).toLocaleTimeString('pt-br', { hour: "2-digit", minute: "2-digit", timeZone: 'America/Sao_Paulo' })}`}
                  </p>
                </button>
              ))}
            </div>
          )}

          {selectedSlot && (
            <div className="mt-6 pt-4 border-t border-border flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Selected:{" "}
                <span className="text-foreground font-medium">
                  {new Date(selectedSlot).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </p>
              <button
                onClick={() => handleBook(selectedSlot)}
                disabled={isBooking}
                className="bg-primary text-primary-foreground px-6 py-2 rounded-md text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {isBooking ? "Booking..." : "Book Appointment"}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
