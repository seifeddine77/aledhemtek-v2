import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Reservation, ReservationStatus } from '../models/reservation.model';

@Injectable({
  providedIn: 'root'
})
export class ReservationService {
  private apiUrl = 'http://localhost:8080/api/reservations';

  constructor(private http: HttpClient) { }

  createReservation(reservation: Reservation): Observable<Reservation> {
    return this.http.post<Reservation>(this.apiUrl, reservation);
  }

  // Méthode pour créer une réservation avec des IDs de tâches
  createReservationWithTaskIds(reservationData: any): Observable<Reservation> {
    return this.http.post<Reservation>(`${this.apiUrl}/with-task-ids`, reservationData);
  }

  updateReservation(id: number, reservation: Reservation): Observable<Reservation> {
    return this.http.put<Reservation>(`${this.apiUrl}/${id}`, reservation);
  }

  deleteReservation(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  getReservationById(id: number): Observable<Reservation> {
    return this.http.get<Reservation>(`${this.apiUrl}/${id}`);
  }

  getAllReservations(): Observable<Reservation[]> {
    return this.http.get<Reservation[]>(this.apiUrl);
  }

  getReservationsByConsultant(consultantId: number): Observable<Reservation[]> {
    return this.http.get<Reservation[]>(`${this.apiUrl}/consultant/${consultantId}`);
  }

  getReservationsByClient(clientId: number): Observable<Reservation[]> {
    return this.http.get<Reservation[]>(`${this.apiUrl}/client/${clientId}`);
  }

  getReservationsByStatus(status: ReservationStatus): Observable<Reservation[]> {
    return this.http.get<Reservation[]>(`${this.apiUrl}/status/${status}`);
  }

  getConsultantCalendar(consultantId: number, startDate: string, endDate: string): Observable<Reservation[]> {
    const params = new HttpParams()
      .set('startDate', startDate)
      .set('endDate', endDate);
    
    return this.http.get<Reservation[]>(`${this.apiUrl}/calendar/consultant/${consultantId}`, { params });
  }

  getUnassignedReservations(): Observable<Reservation[]> {
    return this.http.get<Reservation[]>(`${this.apiUrl}/unassigned`);
  }

  assignConsultantToReservation(reservationId: number, consultantId: number): Observable<Reservation> {
    return this.http.put<Reservation>(`${this.apiUrl}/${reservationId}/assign/${consultantId}`, {});
  }

  updateReservationStatus(reservationId: number, status: ReservationStatus): Observable<Reservation> {
    return this.http.put<Reservation>(`${this.apiUrl}/${reservationId}/status/${status}`, {});
  }

  checkConsultantAvailability(consultantId: number, startDate: string, endDate: string): Observable<boolean> {
    const params = new HttpParams()
      .set('startDate', startDate)
      .set('endDate', endDate);
    
    return this.http.get<boolean>(`${this.apiUrl}/consultant/${consultantId}/available`, { params });
  }

  // Nouvelles méthodes pour le calcul des prix
  getReservationTotalPrice(reservationId: number): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/${reservationId}/total-price`);
  }

  calculateTasksPrice(taskIds: number[]): Observable<number> {
    return this.http.post<number>(`${this.apiUrl}/calculate-price`, taskIds);
  }

  // Méthode publique pour calculer les prix (sans authentification)
  calculateTasksPricePublic(taskIds: number[]): Observable<any> {
    return this.http.post<any>('http://localhost:8080/api/public/calculate-price', { taskIds });
  }

  // Méthode publique pour calculer les prix avec quantités (sans authentification)
  calculateTasksPricePublicWithQuantities(taskIds: number[], taskQuantities: { [key: string]: number }): Observable<any> {
    return this.http.post<any>('http://localhost:8080/api/public/calculate-price', { 
      taskIds, 
      taskQuantities 
    });
  }

  // Méthode publique pour créer une réservation (sans authentification)
  createReservationPublic(reservationData: any): Observable<string> {
    return this.http.post('http://localhost:8080/api/public/create-reservation', reservationData, {
      responseType: 'text' // Spécifier que la réponse est du texte brut
    });
  }

  // Méthodes pour gérer les tâches d'une réservation
  addTasksToReservation(reservationId: number, taskIds: number[], taskQuantities: { [key: string]: number }): Observable<any> {
    const body = { taskIds, taskQuantities };
    return this.http.post(`${this.apiUrl}/${reservationId}/tasks/with-quantities`, body);
  }

  removeTaskFromReservation(reservationId: number, taskId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${reservationId}/tasks/${taskId}`);
  }

  updateReservationTaskQuantity(reservationId: number, taskId: number, quantity: number): Observable<any> {
    const body = { quantity };
    return this.http.put(`${this.apiUrl}/${reservationId}/tasks/${taskId}/quantity`, body);
  }
}
