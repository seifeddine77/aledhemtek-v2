import { Task } from './task.model';

export interface Reservation {
  id?: number;
  startDate: string;
  endDate: string;
  title: string;
  description?: string;
  status: ReservationStatus;
  clientId: number;
  clientName?: string;
  clientPhone?: string;
  consultantId?: number;
  consultantName?: string;
  tasks?: Task[];
  totalPrice?: number;
  createdAt?: string;
  updatedAt?: string;
  
  // Géolocalisation & Accès Chantier
  latitude?: number;
  longitude?: number;
  address?: string;
  buildingDetails?: string;
  housingType?: string;
  urgency?: string;
}

export enum ReservationStatus {
  PENDING = 'PENDING',
  ASSIGNED = 'ASSIGNED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}
