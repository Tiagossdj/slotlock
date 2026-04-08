export interface Resource {
    id: string
    name: string
    type: 'professional' | 'room' | 'equipment'
    createdAt: string
    updatedAt: string
  }
  
  export interface Service {
    id: string
    name: string
    durationMinutes: number
    createdAt: string
    updatedAt: string
  }
  
  export interface Appointment {
    id: string
    userId: string
    serviceId: string
    startTime: string
    endTime: string
    status: 'pending' | 'confirmed' | 'cancelled'
    createdAt: string
    updatedAt: string
  }
  
  export interface AvailableSlot {
    startTime: string
    endTime: string
    available: boolean
  }

  export interface User {
    id: string
    email: string
    role: 'client' | 'admin'
    createdAt: string
    updatedAt: string
  }
  
  export interface AuthResponse {
    token: string
    user: User
  }