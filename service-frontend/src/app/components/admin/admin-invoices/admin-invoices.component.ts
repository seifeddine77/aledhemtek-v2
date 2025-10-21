import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { 
  AdminInvoiceService, 
  AdminInvoice, 
  InvoiceStatus, 
  InvoiceStats 
} from '../../../services/admin-invoice.service';
import { AdminPaymentService, AdminPayment } from '../../../services/admin-payment.service';

@Component({
  selector: 'app-admin-invoices',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatSelectModule,
    MatInputModule,
    MatFormFieldModule,
    MatTooltipModule,
    MatDialogModule
  ],
  templateUrl: './admin-invoices.component.html',
  styleUrl: './admin-invoices.component.css'
})
export class AdminInvoicesComponent implements OnInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  // Expose enum to template
  InvoiceStatus = InvoiceStatus;

  // Data properties
  invoices: AdminInvoice[] = [];
  dataSource = new MatTableDataSource<AdminInvoice>([]);
  stats: InvoiceStats | null = null;
  
  // UI state
  loading = false;
  error: string | null = null;
  
  // Table configuration
  displayedColumns: string[] = [
    'invoiceNumber',
    'clientName',
    'issueDate',
    'dueDate',
    'totalAmount',
    'status',
    'emailSent',
    'actions'
  ];

  // Filter properties
  statusFilter = '';
  searchFilter = '';
  
  // Pagination
  totalElements = 0;
  pageSize = 10;
  currentPage = 0;

  // Status options for filter
  statusOptions = [
    { value: '', label: 'Tous les statuts' },
    { value: 'PENDING', label: 'En attente' },
    { value: 'SENT', label: 'Envoyées' },
    { value: 'PAID', label: 'Payées' },
    { value: 'CANCELLED', label: 'Annulées' },
    { value: 'OVERDUE', label: 'En retard' }
  ];

  // Payment data
  pendingPayments: AdminPayment[] = [];
  loadingPayments = false;

  constructor(
    private adminInvoiceService: AdminInvoiceService,
    private adminPaymentService: AdminPaymentService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadInvoices();
    this.loadStats();
    this.loadPendingPayments();
  }

  /**
   * Load invoices with current filters and pagination
   */
  loadInvoices(): void {
    this.loading = true;
    this.error = null;

    this.adminInvoiceService.getAllInvoices(
      this.currentPage,
      this.pageSize,
      'issueDate',
      'desc',
      this.statusFilter || undefined,
      this.searchFilter || undefined
    ).subscribe({
      next: (response) => {
        console.log('Invoices loaded:', response);
        this.invoices = response.content;
        this.dataSource.data = this.invoices;
        this.totalElements = response.totalElements;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading invoices:', error);
        this.error = 'Erreur lors du chargement des factures';
        this.loading = false;
        this.showError('Erreur lors du chargement des factures');
      }
    });
  }

  /**
   * Load dashboard statistics
   */
  loadStats(): void {
    this.adminInvoiceService.getInvoiceStats().subscribe({
      next: (stats) => {
        console.log('Stats loaded:', stats);
        this.stats = stats;
      },
      error: (error) => {
        console.error('Error loading stats:', error);
      }
    });
  }

  /**
   * Handle page change
   */
  onPageChange(event: any): void {
    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadInvoices();
  }

  /**
   * Apply filters
   */
  applyFilters(): void {
    this.currentPage = 0; // Reset to first page
    this.loadInvoices();
  }

  /**
   * Clear all filters
   */
  clearFilters(): void {
    this.statusFilter = '';
    this.searchFilter = '';
    this.applyFilters();
  }

  /**
   * View invoice details
   */
  viewInvoice(invoice: AdminInvoice): void {
    this.router.navigate(['/admin/invoices', invoice.id]);
  }

  /**
   * Update invoice status
   */
  updateStatus(invoice: AdminInvoice, newStatus: InvoiceStatus | string): void {
    const status = typeof newStatus === 'string' ? newStatus as InvoiceStatus : newStatus;
    this.adminInvoiceService.updateInvoiceStatus(invoice.id, status).subscribe({
      next: (response) => {
        invoice.status = status;
        this.showSuccess(`Statut mis à jour: ${this.getStatusText(status)}`);
        this.loadStats(); // Refresh stats
      },
      error: (error) => {
        console.error('Error updating status:', error);
        this.showError('Erreur lors de la mise à jour du statut');
      }
    });
  }

  /**
   * Download invoice PDF
   */
  downloadPDF(invoice: AdminInvoice): void {
    this.adminInvoiceService.downloadInvoicePDF(invoice.id).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `facture_${invoice.invoiceNumber}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        this.showSuccess('PDF téléchargé avec succès');
      },
      error: (error) => {
        console.error('Error downloading PDF:', error);
        this.showError('Erreur lors du téléchargement du PDF');
      }
    });
  }

  /**
   * Send invoice by email
   */
  sendByEmail(invoice: AdminInvoice): void {
    if (!invoice.clientEmail) {
      this.showError('Aucun email client disponible');
      return;
    }

    this.adminInvoiceService.sendInvoiceByEmail(invoice.id).subscribe({
      next: (response) => {
        invoice.emailSent = true;
        invoice.status = InvoiceStatus.SENT;
        this.showSuccess(`Facture envoyée à ${invoice.clientEmail}`);
        this.loadStats(); // Refresh stats
      },
      error: (error) => {
        console.error('Error sending email:', error);
        this.showError('Erreur lors de l\'envoi de l\'email');
      }
    });
  }

  /**
   * Refresh data
   */
  refresh(): void {
    this.loadInvoices();
    this.loadStats();
  }

  /**
   * Get status text in French
   */
  getStatusText(status: InvoiceStatus): string {
    return this.adminInvoiceService.getStatusText(status);
  }

  /**
   * Get status color for chips
   */
  getStatusColor(status: InvoiceStatus): string {
    return this.adminInvoiceService.getStatusColor(status);
  }



  /**
   * Check if action is available
   */
  canMarkAsPaid(invoice: AdminInvoice): boolean {
    return invoice.status !== InvoiceStatus.PAID && invoice.status !== InvoiceStatus.CANCELLED;
  }

  canMarkAsSent(invoice: AdminInvoice): boolean {
    return invoice.status === InvoiceStatus.PENDING;
  }

  canSendEmail(invoice: AdminInvoice): boolean {
    return !invoice.emailSent && !!invoice.clientEmail && invoice.clientEmail.length > 0;
  }

  /**
   * Show success message
   */
  private showSuccess(message: string): void {
    this.snackBar.open(message, 'Fermer', {
      duration: 3000,
      panelClass: ['success-snackbar']
    });
  }

  /**
   * Show error message
   */
  private showError(message: string): void {
    this.snackBar.open(message, 'Fermer', {
      duration: 5000,
      panelClass: ['error-snackbar']
    });
  }

  /**
   * Load pending payments
   */
  loadPendingPayments(): void {
    this.loadingPayments = true;
    this.adminPaymentService.getPendingPayments().subscribe({
      next: (payments) => {
        this.pendingPayments = payments;
        this.loadingPayments = false;
      },
      error: (error) => {
        console.error('Error loading pending payments:', error);
        this.loadingPayments = false;
        this.showError('Erreur lors du chargement des paiements en attente');
      }
    });
  }

  /**
   * Validate a payment
   */
  validatePayment(payment: AdminPayment, approved: boolean): void {
    const notes = approved ? 'Paiement validé par l\'administrateur' : 'Paiement rejeté par l\'administrateur';
    
    this.adminPaymentService.validatePayment(payment.id, { approved, notes }).subscribe({
      next: (response) => {
        this.showSuccess(response.message);
        this.loadPendingPayments(); // Recharger la liste
        this.loadStats(); // Mettre à jour les statistiques
      },
      error: (error) => {
        console.error('Error validating payment:', error);
        this.showError('Erreur lors de la validation du paiement');
      }
    });
  }

  /**
   * Validate all cash payments
   */
  validateAllCashPayments(): void {
    const cashPayments = this.pendingPayments.filter(p => p.paymentMethod === 'CASH');
    if (cashPayments.length === 0) {
      this.showError('Aucun paiement en espèces en attente');
      return;
    }

    // Valider tous les paiements en espèces
    cashPayments.forEach(payment => {
      this.validatePayment(payment, true);
    });
  }

  /**
   * Get payment method display name
   */
  getPaymentMethodName(method: string): string {
    return this.adminPaymentService.getPaymentMethodDisplayName(method);
  }

  /**
   * Get payment method color
   */
  getPaymentMethodColor(method: string): string {
    const colors: { [key: string]: string } = {
      'CASH': 'accent',
      'CHECK': 'primary',
      'BANK_TRANSFER': 'warn',
      'CREDIT_CARD': 'primary',
      'STRIPE': 'primary',
      'PAYPAL': 'accent'
    };
    return colors[method] || '';
  }

  /**
   * Format currency
   */
  formatCurrency(amount: number): string {
    return this.adminPaymentService.formatCurrency(amount);
  }

  /**
   * Format date
   */
  formatDate(dateString: string): string {
    return this.adminPaymentService.formatDate(dateString);
  }
}
