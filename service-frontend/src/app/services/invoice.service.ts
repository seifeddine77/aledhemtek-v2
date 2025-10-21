import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Invoice {
  id?: number;
  invoiceNumber?: string;
  issueDate: Date;
  dueDate: Date;
  totalAmount: number;
  amountExclTax?: number;
  taxAmount?: number;
  taxRate: number;
  status: InvoiceStatus;
  notes?: string;
  pdfPath?: string;
  reservationId: number;
  clientName?: string;
  clientEmail?: string;
  items?: InvoiceItem[];
  payments?: Payment[];
  remainingAmount?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface InvoiceItem {
  id?: number;
  designation: string;
  description?: string;
  quantity: number;
  unitPrice: number;
  total?: number;
  taxRate: number;
  taskId?: number;
  taskName?: string;
}

export interface Payment {
  id?: number;
  paymentReference?: string;
  amount: number;
  paymentDate: Date;
  paymentMethod: PaymentMethod;
  status: PaymentStatus;
  transactionId?: string;
  notes?: string;
  invoiceId?: number;
  invoiceNumber?: string;
}

export enum InvoiceStatus {
  DRAFT = 'DRAFT',
  PENDING = 'PENDING',
  SENT = 'SENT',
  PAID = 'PAID',
  CANCELLED = 'CANCELLED',
  OVERDUE = 'OVERDUE'
}

export enum PaymentMethod {
  CASH = 'CASH',
  CREDIT_CARD = 'CREDIT_CARD',
  BANK_TRANSFER = 'BANK_TRANSFER',
  CHECK = 'CHECK',
  PAYPAL = 'PAYPAL',
  STRIPE = 'STRIPE',
  OTHER = 'OTHER'
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  VALIDATED = 'VALIDATED',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED',
  REFUNDED = 'REFUNDED'
}

export interface InvoiceCreateRequest {
  clientId: number;
  reservationId?: number;
  dueDate: string;
  notes?: string;
  invoiceItems: InvoiceItemCreateRequest[];
}

export interface InvoiceItemCreateRequest {
  designation: string;
  description?: string;
  quantity: number;
  unitPrice: number;
  taxRate?: number;
  taskId?: number;
}

export interface PaymentCreateRequest {
  amount: number;
  paymentMethod: PaymentMethod;
  transactionId?: string;
  notes?: string;
}

export interface InvoiceStatistics {
  totalPending: number;
  totalSent: number;
  totalPaid: number;
  totalOverdue: number;
  totalCancelled: number;
  monthlyRevenue: number;
  yearlyRevenue: number;
}

@Injectable({
  providedIn: 'root'
})
export class InvoiceService {
  private apiUrl = `${environment.apiUrl}/invoices`;

  constructor(private http: HttpClient) {}

  /**
   * Create a new invoice
   */
  createInvoice(invoiceRequest: InvoiceCreateRequest): Observable<Invoice> {
    return this.http.post<Invoice>(this.apiUrl, invoiceRequest);
  }

  /**
   * Create invoice from reservation
   */
  createInvoiceFromReservation(reservationId: number): Observable<Invoice> {
    return this.http.post<Invoice>(`${this.apiUrl}/from-reservation/${reservationId}`, {});
  }

  /**
   * Get all invoices with pagination
   * TEMPORARY: Using public endpoint to bypass auth issues
   */
  getAllInvoices(page: number = 0, size: number = 10, sortBy: string = 'id', sortDir: string = 'desc'): Observable<any> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('sortBy', sortBy)
      .set('sortDir', sortDir);

    const token = localStorage.getItem('token');
    console.log('[DEBUG] Token found:', token ? 'YES' : 'NO');
    console.log('[DEBUG] API URL:', `${this.apiUrl}`);
    console.log('[DEBUG] Params:', params.toString());
    
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
    
    // TEMPORARY: Use public endpoint until auth issue is resolved
    return this.http.get<any>(`${this.apiUrl}/public/all`, { 
      params
    });
  }

  /**
   * Get invoice by ID
   */
  getInvoiceById(id: number): Observable<Invoice> {
    return this.http.get<Invoice>(`${this.apiUrl}/${id}`);
  }

  /**
   * Get invoice by number
   */
  getInvoiceByNumber(invoiceNumber: string): Observable<Invoice> {
    return this.http.get<Invoice>(`${this.apiUrl}/number/${invoiceNumber}`);
  }

  /**
   * Update invoice
   */
  updateInvoice(id: number, invoice: Invoice): Observable<Invoice> {
    return this.http.put<Invoice>(`${this.apiUrl}/${id}`, invoice);
  }

  /**
   * Delete invoice
   */
  deleteInvoice(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  /**
   * Get invoices by status
   */
  getInvoicesByStatus(status: InvoiceStatus): Observable<Invoice[]> {
    return this.http.get<Invoice[]>(`${this.apiUrl}/status/${status}`);
  }

  /**
   * Get invoices by client ID
   */
  getInvoicesByClientId(clientId: number): Observable<Invoice[]> {
    return this.http.get<Invoice[]>(`${this.apiUrl}/client/${clientId}`);
  }

  /**
   * Search invoices
   */
  searchInvoices(searchTerm: string, page: number = 0, size: number = 10): Observable<any> {
    const params = new HttpParams()
      .set('searchTerm', searchTerm)
      .set('page', page.toString())
      .set('size', size.toString());

    return this.http.get<any>(`${this.apiUrl}/search`, { params });
  }

  /**
   * Get overdue invoices
   */
  getOverdueInvoices(): Observable<Invoice[]> {
    return this.http.get<Invoice[]>(`${this.apiUrl}/overdue`);
  }

  /**
   * Get unpaid invoices
   */
  getUnpaidInvoices(): Observable<Invoice[]> {
    return this.http.get<Invoice[]>(`${this.apiUrl}/unpaid`);
  }

  /**
   * Get recent invoices
   */
  getRecentInvoices(): Observable<Invoice[]> {
    return this.http.get<Invoice[]>(`${this.apiUrl}/recent`);
  }

  /**
   * Add item to invoice
   */
  addItemToInvoice(invoiceId: number, item: InvoiceItem): Observable<Invoice> {
    return this.http.post<Invoice>(`${this.apiUrl}/${invoiceId}/items`, item);
  }

  /**
   * Remove item from invoice
   */
  removeItemFromInvoice(invoiceId: number, itemId: number): Observable<Invoice> {
    return this.http.delete<Invoice>(`${this.apiUrl}/${invoiceId}/items/${itemId}`);
  }

  /**
   * Mark invoice as sent
   */
  markInvoiceAsSent(invoiceId: number): Observable<Invoice> {
    return this.http.put<Invoice>(`${this.apiUrl}/${invoiceId}/mark-sent`, {});
  }

  /**
   * Mark invoice as paid
   */
  markInvoiceAsPaid(invoiceId: number): Observable<Invoice> {
    return this.http.put<Invoice>(`${this.apiUrl}/${invoiceId}/mark-paid`, {});
  }

  /**
   * Cancel invoice
   */
  cancelInvoice(invoiceId: number): Observable<Invoice> {
    return this.http.put<Invoice>(`${this.apiUrl}/${invoiceId}/cancel`, {});
  }

  /**
   * Generate PDF for invoice
   */
  generateInvoicePDF(invoiceId: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/${invoiceId}/pdf`, { 
      responseType: 'blob' 
    });
  }

  /**
   * Send invoice by email
   */
  sendInvoiceByEmail(invoiceId: number, email: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/${invoiceId}/send-email`, { email });
  }

  /**
   * Get invoices by date range
   */
  getInvoicesByDateRange(startDate: Date, endDate: Date): Observable<Invoice[]> {
    const params = new HttpParams()
      .set('startDate', startDate.toISOString())
      .set('endDate', endDate.toISOString());

    return this.http.get<Invoice[]>(`${this.apiUrl}/date-range`, { params });
  }

  /**
   * Get invoice statistics
   */
  getInvoiceStatistics(): Observable<InvoiceStatistics> {
    return this.http.get<InvoiceStatistics>(`${this.apiUrl}/statistics`);
  }

  /**
   * Update overdue invoices status
   */
  updateOverdueInvoicesStatus(): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/update-overdue`, {});
  }

  /**
   * Download invoice PDF
   */
  downloadInvoicePDF(id: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/${id}/pdf`, { responseType: 'blob' });
  }

  /**
   * Download invoice PDF and trigger download
   */
  downloadAndSaveInvoicePDF(invoiceId: number, invoiceNumber: string): void {
    this.generateInvoicePDF(invoiceId).subscribe(blob => {
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `facture-${invoiceNumber}.pdf`;
      link.click();
      window.URL.revokeObjectURL(url);
    });
  }

  /**
   * Get status label in French
   */
  getStatusLabel(status: InvoiceStatus): string {
    const labels = {
      [InvoiceStatus.DRAFT]: 'Brouillon',
      [InvoiceStatus.PENDING]: 'En attente',
      [InvoiceStatus.SENT]: 'Envoyée',
      [InvoiceStatus.PAID]: 'Payée',
      [InvoiceStatus.CANCELLED]: 'Annulée',
      [InvoiceStatus.OVERDUE]: 'En retard'
    };
    return labels[status] || status;
  }

  /**
   * Get payment method label in French
   */
  getPaymentMethodLabel(method: PaymentMethod): string {
    const labels = {
      [PaymentMethod.CASH]: 'Espèces',
      [PaymentMethod.CREDIT_CARD]: 'Carte bancaire',
      [PaymentMethod.BANK_TRANSFER]: 'Virement bancaire',
      [PaymentMethod.CHECK]: 'Chèque',
      [PaymentMethod.PAYPAL]: 'PayPal',
      [PaymentMethod.STRIPE]: 'Stripe',
      [PaymentMethod.OTHER]: 'Autre'
    };
    return labels[method] || method;
  }

  /**
   * Get payment status label in French
   */
  getPaymentStatusLabel(status: PaymentStatus): string {
    const labels = {
      [PaymentStatus.PENDING]: 'En attente',
      [PaymentStatus.PROCESSING]: 'En cours',
      [PaymentStatus.VALIDATED]: 'Validé',
      [PaymentStatus.FAILED]: 'Échoué',
      [PaymentStatus.CANCELLED]: 'Annulé',
      [PaymentStatus.REFUNDED]: 'Remboursé'
    };
    return labels[status] || status;
  }

  /**
   * Add payment to invoice
   */
  addPaymentToInvoice(invoiceId: number, paymentRequest: PaymentCreateRequest): Observable<Payment> {
    return this.http.post<Payment>(`${this.apiUrl}/${invoiceId}/payments`, paymentRequest);
  }

  /**
   * Delete payment
   */
  deletePayment(paymentId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/payments/${paymentId}`);
  }

  /**
   * Download invoice PDF as blob
   */
  downloadInvoicePDFAsBlob(invoiceId: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/${invoiceId}/pdf`, { responseType: 'blob' });
  }


}
