import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Evaluation, EvaluationSummary } from '../models/evaluation.model';

@Injectable({
  providedIn: 'root'
})
export class EvaluationService {
  private apiUrl = 'http://localhost:8080/api/evaluations';

  constructor(private http: HttpClient) {}

  // Create a new evaluation
  createEvaluation(evaluation: Evaluation): Observable<Evaluation> {
    return this.http.post<Evaluation>(this.apiUrl, evaluation);
  }

  // Get evaluation by reservation ID
  getEvaluationByReservation(reservationId: number): Observable<Evaluation> {
    return this.http.get<Evaluation>(`${this.apiUrl}/reservation/${reservationId}`);
  }

  // Get evaluations for a consultant
  getConsultantEvaluations(consultantId: number): Observable<Evaluation[]> {
    return this.http.get<Evaluation[]>(`${this.apiUrl}/consultant/${consultantId}`);
  }

  // Get evaluation summary for a consultant
  getConsultantEvaluationSummary(consultantId: number): Observable<EvaluationSummary> {
    return this.http.get<EvaluationSummary>(`${this.apiUrl}/consultant/${consultantId}/summary`);
  }

  // Get evaluations by client
  getClientEvaluations(clientId: number): Observable<Evaluation[]> {
    return this.http.get<Evaluation[]>(`${this.apiUrl}/client/${clientId}`);
  }

  // Update an evaluation
  updateEvaluation(id: number, evaluation: Evaluation): Observable<Evaluation> {
    return this.http.put<Evaluation>(`${this.apiUrl}/${id}`, evaluation);
  }

  // Delete an evaluation
  deleteEvaluation(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  // Get all evaluations (admin only)
  getAllEvaluations(): Observable<Evaluation[]> {
    return this.http.get<Evaluation[]>(this.apiUrl);
  }

  // Get featured evaluations for home page (public)
  getFeaturedEvaluationsForHome(): Observable<Evaluation[]> {
    return this.http.get<Evaluation[]>(`${this.apiUrl}/public/featured`);
  }

  // Check if reservation can be evaluated
  canEvaluateReservation(reservationId: number): Observable<boolean> {
    return this.http.get<boolean>(`${this.apiUrl}/can-evaluate/${reservationId}`);
  }
}
