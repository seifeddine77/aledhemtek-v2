import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface AdminPayment {
  id: number;
  paymentReference: string;
  amount: number;
  paymentMethod: string;
  paymentDate: string;
  status: string;
  notes: string;
  invoiceId: number;
  invoiceNumber: string;
  clientName: string;
  clientEmail: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentValidationRequest {
  approved: boolean;
  notes: string;
}

export interface PaymentValidationResponse {
  status: string;
  payment: AdminPayment;
  message: string;
}

export interface PaymentStats {
  totalPayments: number;
  pendingPayments: number;
  validatedPayments: number;
  failedPayments: number;
  totalAmount: number;
  successRate: number;
}

@Injectable({
  providedIn: 'root'
})
export class AdminPaymentService {
  private apiUrl = `${environment.apiUrl}/payments`;

  constructor(private http: HttpClient) {}

  private getHttpOptions() {
    return {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      })
    };
  }

  /**
   * Get all payments for admin with pagination and filters
   */
  getAllPayments(
    page: number = 0,
    size: number = 10,
    sortBy: string = 'paymentDate',
    sortDir: string = 'desc',
    status?: string
  ): Observable<any> {
    let params = `page=${page}&size=${size}&sortBy=${sortBy}&sortDir=${sortDir}`;
    if (status) {
      params += `&status=${status}`;
    }
    
    return this.http.get<any>(`${this.apiUrl}/admin/all?${params}`, this.getHttpOptions());
  }

  /**
   * Get pending payments only
   */
  getPendingPayments(): Observable<AdminPayment[]> {
    return this.http.get<AdminPayment[]>(`${this.apiUrl}/admin/pending`, this.getHttpOptions());
  }

  /**
   * Validate or reject a payment
   */
  validatePayment(paymentId: number, request: PaymentValidationRequest): Observable<PaymentValidationResponse> {
    return this.http.post<PaymentValidationResponse>(
      `${this.apiUrl}/${paymentId}/validate`, 
      request, 
      this.getHttpOptions()
    );
  }

  /**
   * Get payment statistics
   */
  getPaymentStatistics(): Observable<PaymentStats> {
    return this.http.get<PaymentStats>(`${this.apiUrl}/statistics`, this.getHttpOptions());
  }

  /**
   * Validate multiple payments at once
   */
  validateMultiplePayments(paymentIds: number[], approved: boolean, notes: string): Observable<any> {
    const request = {
      paymentIds,
      approved,
      notes
    };
    return this.http.post<any>(`${this.apiUrl}/admin/validate-multiple`, request, this.getHttpOptions());
  }

  /**
   * Get payment method display name
   */
  getPaymentMethodDisplayName(method: string): string {
    const displayNames: { [key: string]: string } = {
      'CASH': 'Espèces',
      'CHECK': 'Chèque',
      'CREDIT_CARD': 'Carte bancaire',
      'STRIPE': 'Stripe',
      'PAYPAL': 'PayPal',
      'BANK_TRANSFER': 'Virement bancaire',
      'OTHER': 'Autre'
    };
    return displayNames[method] || method;
  }

  /**
   * Get payment status display name
   */
  getPaymentStatusDisplayName(status: string): string {
    const displayNames: { [key: string]: string } = {
      'PENDING': 'En attente',
      'PROCESSING': 'En cours',
      'VALIDATED': 'Validé',
      'FAILED': 'Échoué',
      'CANCELLED': 'Annulé',
      'REFUNDED': 'Remboursé'
    };
    return displayNames[status] || status;
  }

  /**
   * Get payment status color
   */
  getPaymentStatusColor(status: string): string {
    const colors: { [key: string]: string } = {
      'PENDING': 'warn',
      'PROCESSING': 'accent',
      'VALIDATED': 'primary',
      'FAILED': 'warn',
      'CANCELLED': '',
      'REFUNDED': 'accent'
    };
    return colors[status] || '';
  }

  /**
   * Format currency
   */
  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  }

  /**
   * Format date
   */
  formatDate(dateString: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}
