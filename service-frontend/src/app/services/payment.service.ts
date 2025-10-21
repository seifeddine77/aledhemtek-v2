import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface PaymentRequest {
  invoiceId: number;
  amount: number;
  paymentMethod: string;
  cardDetails?: {
    cardNumber: string;
    expiryMonth: number;
    expiryYear: number;
    cvv: string;
    cardholderName: string;
  };
}

export interface PaymentResponse {
  success: boolean;
  message: string;
  paymentId?: number;
  transactionId?: string;
  redirectUrl?: string;
}

export interface PaymentHistory {
  id: number;
  invoiceId: number;
  invoiceNumber: string;
  amount: number;
  paymentMethod: string;
  paymentDate: string;
  status: string;
  transactionId?: string;
}

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  private apiUrl = `${environment.apiUrl}/payments`;

  constructor(private http: HttpClient) {}

  /**
   * Process payment for an invoice
   */
  processPayment(paymentRequest: PaymentRequest): Observable<PaymentResponse> {
    return this.http.post<PaymentResponse>(`${environment.apiUrl}/client/payments/process`, paymentRequest);
  }

  /**
   * Get payment history for a client
   */
  getClientPaymentHistory(clientId: number): Observable<PaymentHistory[]> {
    return this.http.get<PaymentHistory[]>(`${this.apiUrl}/client/${clientId}/history`);
  }

  /**
   * Get payment details by ID
   */
  getPaymentById(paymentId: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${paymentId}`);
  }

  /**
   * Verify payment status
   */
  verifyPaymentStatus(transactionId: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/verify/${transactionId}`);
  }

  /**
   * Cancel payment
   */
  cancelPayment(paymentId: number): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/${paymentId}/cancel`, {});
  }

  /**
   * Refund payment
   */
  refundPayment(paymentId: number, amount?: number): Observable<any> {
    const body = amount ? { amount } : {};
    return this.http.post<any>(`${this.apiUrl}/${paymentId}/refund`, body);
  }

  /**
   * Get available payment methods
   */
  getAvailablePaymentMethods(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/methods`);
  }

  /**
   * Validate card details
   */
  validateCardDetails(cardDetails: any): boolean {
    // Basic validation
    if (!cardDetails.cardNumber || cardDetails.cardNumber.length !== 16) {
      return false;
    }
    if (!cardDetails.cvv || cardDetails.cvv.length < 3 || cardDetails.cvv.length > 4) {
      return false;
    }
    if (!cardDetails.expiryMonth || cardDetails.expiryMonth < 1 || cardDetails.expiryMonth > 12) {
      return false;
    }
    if (!cardDetails.expiryYear || cardDetails.expiryYear < new Date().getFullYear()) {
      return false;
    }
    if (!cardDetails.cardholderName || cardDetails.cardholderName.trim().length === 0) {
      return false;
    }
    return true;
  }

  /**
   * Format card number for display
   */
  formatCardNumber(cardNumber: string): string {
    return cardNumber.replace(/(.{4})/g, '$1 ').trim();
  }

  /**
   * Get payment method display name
   */
  getPaymentMethodDisplayName(method: string): string {
    const displayNames: { [key: string]: string } = {
      'stripe': 'Carte bancaire',
      'paypal': 'PayPal',
      'bank_transfer': 'Virement bancaire',
      'cash': 'Espèces',
      'check': 'Chèque'
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
      'COMPLETED': 'Terminé',
      'FAILED': 'Échoué',
      'CANCELLED': 'Annulé',
      'REFUNDED': 'Remboursé'
    };
    return displayNames[status] || status;
  }
}
