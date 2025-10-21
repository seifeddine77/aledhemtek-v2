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
  
  // Géolocalisation
  latitude?: number;
  longitude?: number;
  address?: string;
}

export enum ReservationStatus {
  PENDING = 'PENDING',
  ASSIGNED = 'ASSIGNED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}
