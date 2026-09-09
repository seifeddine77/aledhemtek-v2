import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface ResumeParseResponse {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  companyName?: string;
  siret?: string;
  profession?: string;
  exp?: number;
  skills?: string[];
  certifications?: string[];
  insuranceProvider?: string;
  insurancePolicyNumber?: string;
  insuranceExpiryDate?: string;
  suggestedRadiusKm?: number;
  rawTextSnippet?: string;
  confidenceScore?: number;
  aiEnhanced?: boolean;
  message?: string;
}

export interface SiretVerificationResponse {
  siret: string;
  formatted: string;
  valid: boolean;
  message: string;
}

@Injectable({
  providedIn: 'root'
})
export class AiService {
  private readonly baseUrl = `${environment.apiUrl}/ai`;

  constructor(private http: HttpClient) {}

  /**
   * Analyse et extrait les données d'un CV ou justificatif professionnel
   */
  parseResume(file: File): Observable<ResumeParseResponse> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<ResumeParseResponse>(`${this.baseUrl}/parse-resume`, formData);
  }

  /**
   * Vérifie la validité d'un numéro SIRET (14 chiffres et checksum Luhn)
   */
  verifySiret(siret: string): Observable<SiretVerificationResponse> {
    return this.http.post<SiretVerificationResponse>(`${this.baseUrl}/verify-siret`, { siret });
  }
}
