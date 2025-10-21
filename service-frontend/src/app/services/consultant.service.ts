import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ConsultantInterface } from '../models/consultant-interface';
@Injectable({
  providedIn: 'root'
})
export class ConsultantService {

  private baseUrl = 'http://localhost:8080/api/consultants';
  constructor(private http: HttpClient) {}
  getAll(): Observable<ConsultantInterface[]> {
    return this.http.get<ConsultantInterface[]>(`${this.baseUrl}/get-all`);
  }

  getById(id: number): Observable<ConsultantInterface> {
    return this.http.get<ConsultantInterface>(`${this.baseUrl}/get-salarie/${id}`);
  }

  update(id: number, dto: ConsultantInterface): Observable<ConsultantInterface> {
    return this.http.put<ConsultantInterface>(`${this.baseUrl}/update/${id}`, dto);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/delete/${id}`);
  }
  approve(id: number): Observable<ConsultantInterface> {
    return this.http.put<ConsultantInterface>(`${this.baseUrl}/approve/${id}`, {});
  }


  reject(id: number): Observable<ConsultantInterface> {
    return this.http.put<ConsultantInterface>(`${this.baseUrl}/reject/${id}`, {});
  }

  // Méthode pour télécharger le CV d'un consultant
  downloadResume(filename: string): Observable<Blob> {
    // Utiliser l'endpoint du contrôleur qui a la configuration CORS
    return this.http.get(`${this.baseUrl}/uploads/resumes/${filename}`, {
      responseType: 'blob'
    });
  }

  // Méthode pour obtenir l'URL du CV
  getResumeUrl(filename: string): string {
    // Utiliser l'endpoint du contrôleur qui a la configuration CORS
    return `${this.baseUrl}/uploads/resumes/${filename}`;
  }
}
