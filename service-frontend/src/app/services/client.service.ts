import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Client } from '../models/client.model';

@Injectable({
  providedIn: 'root'
})
export class ClientService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  private getHttpOptions() {
    return {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      })
    };
  }

  getAllClients(): Observable<Client[]> {
    return this.http.get<Client[]>(`${this.apiUrl}/admin/clients`, this.getHttpOptions());
  }

  getClientById(id: number): Observable<Client> {
    return this.http.get<Client>(`${this.apiUrl}/clients/${id}`, this.getHttpOptions());
  }

  createClient(client: Client): Observable<Client> {
    return this.http.post<Client>(`${this.apiUrl}/clients`, client, this.getHttpOptions());
  }

  updateClient(id: number, client: Client): Observable<Client> {
    return this.http.put<Client>(`${this.apiUrl}/clients/${id}`, client, this.getHttpOptions());
  }

  deleteClient(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/clients/${id}`, this.getHttpOptions());
  }

  searchClients(query: string): Observable<Client[]> {
    return this.http.get<Client[]>(`${this.apiUrl}/clients/search?q=${query}`, this.getHttpOptions());
  }

  getClientReservations(clientId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/clients/${clientId}/reservations`, this.getHttpOptions());
  }

  getClientInvoices(clientId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/clients/${clientId}/invoices`, this.getHttpOptions());
  }
}
