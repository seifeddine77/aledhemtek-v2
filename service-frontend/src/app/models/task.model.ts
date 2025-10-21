export interface Task {
  id?: number;
  name: string;
  duration: number;
  description?: string;
  imageName?: string;
  serviceId: number;
  reservationId?: number;
  consultantId?: number;
}
