import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

// Client Invoice Interfaces
export interface ClientInvoice {
  id: number;
  invoiceNumber: string;
  issueDate: string;
  dueDate: string;
  totalAmount: number;
  status: InvoiceStatus;
  paidAmount: number;
  remainingAmount: number;
  clientId: number;
  clientName: string;
  clientEmail: string;
  reservation?: {
    id: number;
    title: string;
    startDate: string;
    endDate: string;
  };
  items: InvoiceItem[];
  payments: InvoicePayment[];
  pdfPath?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface InvoiceItem {
  id: number;
  description: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface InvoicePayment {
  id: number;
  amount: number;
  paymentDate: string;
  paymentMethod: string;
  transactionId?: string;
  notes?: string;
}

export enum InvoiceStatus {
  DRAFT = 'DRAFT',
  PENDING = 'PENDING',
  SENT = 'SENT',
  PAID = 'PAID',
  OVERDUE = 'OVERDUE',
  CANCELLED = 'CANCELLED'
}

export interface ClientInvoiceStats {
  totalInvoices: number;
  totalAmount: number;
  paidAmount: number;
  pendingAmount: number;
  overdueAmount: number;
  statusCounts: {
    [key in InvoiceStatus]: number;
  };
}

@Injectable({
  providedIn: 'root'
})
export class ClientInvoiceService {
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

  // Get client's own invoices
  getMyInvoices(): Observable<ClientInvoice[]> {
    return this.http.get<ClientInvoice[]>(`${this.apiUrl}/client/invoices`, this.getHttpOptions());
  }

  // Get specific client's invoices (for admin or the client themselves)
  getClientInvoices(clientId: number): Observable<ClientInvoice[]> {
    return this.http.get<ClientInvoice[]>(`${this.apiUrl}/clients/${clientId}/invoices`, this.getHttpOptions());
  }

  // Get invoice details by ID
  getInvoiceById(invoiceId: number): Observable<ClientInvoice> {
    return this.http.get<ClientInvoice>(`${this.apiUrl}/client/invoices/${invoiceId}`, this.getHttpOptions());
  }

  // Download invoice PDF
  downloadInvoicePDF(invoiceId: number): Observable<Blob> {
    const options = {
      ...this.getHttpOptions(),
      responseType: 'blob' as 'json'
    };
    return this.http.get<Blob>(`${this.apiUrl}/client/invoices/${invoiceId}/pdf`, options);
  }

  // Get client invoice statistics
  getClientInvoiceStats(clientId?: number): Observable<ClientInvoiceStats> {
    const url = clientId 
      ? `${this.apiUrl}/clients/${clientId}/invoices/stats`
      : `${this.apiUrl}/client/invoices/stats`;
    return this.http.get<ClientInvoiceStats>(url, this.getHttpOptions());
  }

  // Utility Methods
  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount || 0);
  }

  formatDate(dateString: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }

  formatDateTime(dateString: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getStatusText(status: InvoiceStatus): string {
    switch (status) {
      case InvoiceStatus.DRAFT:
        return 'Brouillon';
      case InvoiceStatus.PENDING:
        return 'En attente';
      case InvoiceStatus.SENT:
        return 'Envoyée';
      case InvoiceStatus.PAID:
        return 'Payée';
      case InvoiceStatus.OVERDUE:
        return 'En retard';
      case InvoiceStatus.CANCELLED:
        return 'Annulée';
      default:
        return status;
    }
  }

  getStatusColor(status: InvoiceStatus): string {
    switch (status) {
      case InvoiceStatus.DRAFT:
        return '#ff9800';
      case InvoiceStatus.PENDING:
        return '#2196f3';
      case InvoiceStatus.SENT:
        return '#03a9f4';
      case InvoiceStatus.PAID:
        return '#4caf50';
      case InvoiceStatus.OVERDUE:
        return '#f44336';
      case InvoiceStatus.CANCELLED:
        return '#9e9e9e';
      default:
        return '#757575';
    }
  }

  isPayable(invoice: ClientInvoice): boolean {
    return invoice.status === InvoiceStatus.PENDING ||
           invoice.status === InvoiceStatus.SENT || 
           invoice.status === InvoiceStatus.OVERDUE;
  }

  isDownloadable(invoice: ClientInvoice): boolean {
    return !!(invoice.pdfPath || 
              invoice.status === InvoiceStatus.PENDING ||
              invoice.status === InvoiceStatus.SENT || 
              invoice.status === InvoiceStatus.PAID || 
              invoice.status === InvoiceStatus.OVERDUE);
  }

  calculateProgress(invoice: ClientInvoice): number {
    if (invoice.totalAmount === 0) return 0;
    return Math.round((invoice.paidAmount / invoice.totalAmount) * 100);
  }
}
