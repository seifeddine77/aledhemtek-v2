export interface Client {
  id?: number;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  city?: string;
  postalCode?: string;
  country?: string;
  dateOfBirth?: string;
  profilePicture?: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
  
  // Relations
  reservations?: any[];
  invoices?: any[];
  evaluations?: any[];
}

export interface ClientCreateRequest {
  name: string;
  email: string;
  password: string;
  phone?: string;
  address?: string;
  city?: string;
  postalCode?: string;
  country?: string;
  dateOfBirth?: string;
}

export interface ClientUpdateRequest {
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  postalCode?: string;
  country?: string;
  dateOfBirth?: string;
}

export interface ClientFilter {
  search?: string;
  city?: string;
  isActive?: boolean;
  startDate?: string;
  endDate?: string;
}

export interface ClientStatistics {
  totalClients: number;
  activeClients: number;
  newClientsThisMonth: number;
  totalReservations: number;
  totalInvoices: number;
  averageReservationsPerClient: number;
}
