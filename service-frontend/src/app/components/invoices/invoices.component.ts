import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatCardModule } from '@angular/material/card';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { InvoiceService, Invoice, InvoiceStatus } from '../../services/invoice.service';

@Component({
  selector: 'app-invoices',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatSelectModule,
    MatChipsModule,
    MatDialogModule,
    MatSnackBarModule,
    MatCardModule,
    MatTooltipModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './invoices.component.html',
  styleUrl: './invoices.component.css'
})
export class InvoicesComponent implements OnInit {
  invoices: Invoice[] = [];
  displayedColumns: string[] = [
    'invoiceNumber', 
    'clientName', 
    'issueDate', 
    'dueDate', 
    'totalAmount', 
    'status', 
    'actions'
  ];
  
  // Pagination
  totalElements = 0;
  pageSize = 10;
  pageIndex = 0;
  
  // Filtering
  searchTerm = '';
  selectedStatus: InvoiceStatus | '' = '';
  
  // Status options
  statusOptions = [
    { value: '', label: 'Tous les statuts' },
    { value: InvoiceStatus.PENDING, label: 'En attente' },
    { value: InvoiceStatus.SENT, label: 'Envoyée' },
    { value: InvoiceStatus.PAID, label: 'Payée' },
    { value: InvoiceStatus.OVERDUE, label: 'En retard' },
    { value: InvoiceStatus.CANCELLED, label: 'Annulée' }
  ];
  
  loading = false;
  invoices: Invoice[] = [];
  totalElements = 0;

  constructor(
    private invoiceService: InvoiceService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {
    console.log('[DEBUG] InvoicesComponent constructor called');
  }

  ngOnInit(): void {
    console.log('[DEBUG] InvoicesComponent ngOnInit called');
    this.loadInvoices();
  }

  loadInvoices(): void {
    console.log('[DEBUG] loadInvoices called');
    this.loading = true;
    
    if (this.searchTerm) {
      console.log('[DEBUG] Loading invoices by search term:', this.searchTerm);
      this.searchInvoices();
    } else if (this.selectedStatus) {
      console.log('[DEBUG] Loading invoices by status:', this.selectedStatus);
      this.loadInvoicesByStatus();
    } else {
      console.log('[DEBUG] Loading all invoices');
      this.loadAllInvoices();
    }
  }

  loadAllInvoices(): void {
    console.log('[DEBUG] loadAllInvoices called');
    this.loading = true;
    this.invoiceService.getAllInvoices(this.pageIndex, this.pageSize)
      .subscribe({
        next: (response) => {
          console.log('[DEBUG] Invoice response received:', response);
          this.invoices = response.content || [];
          this.totalElements = response.totalElements || 0;
          this.loading = false;
          console.log('[DEBUG] Invoices loaded:', this.invoices.length, 'items');
        },
        error: (error) => {
          console.error('[DEBUG] Error loading invoices:', error);
          this.snackBar.open('Erreur lors du chargement des factures', 'Fermer', { duration: 3000 });
          this.loading = false;
        }
      });
  }

  loadInvoicesByStatus(): void {
    this.invoiceService.getInvoicesByStatus(this.selectedStatus as InvoiceStatus)
      .subscribe({
        next: (invoices) => {
          this.invoices = invoices;
          this.totalElements = invoices.length;
          this.loading = false;
        },
        error: (error) => {
          console.error('Error loading invoices by status:', error);
          this.snackBar.open('Erreur lors du chargement des factures', 'Fermer', { duration: 3000 });
          this.loading = false;
        }
      });
  }

  searchInvoices(): void {
    this.invoiceService.searchInvoices(this.searchTerm, this.pageIndex, this.pageSize)
      .subscribe({
        next: (response) => {
          this.invoices = response.content || [];
          this.totalElements = response.totalElements || 0;
          this.loading = false;
        },
        error: (error) => {
          console.error('Error searching invoices:', error);
          this.showError('Erreur lors de la recherche');
          this.loading = false;
        }
      });
  }

  onPageChange(event: any): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadInvoices();
  }

  onSearch(): void {
    this.pageIndex = 0;
    this.loadInvoices();
  }

  onStatusChange(): void {
    this.pageIndex = 0;
    this.loadInvoices();
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.selectedStatus = '';
    this.pageIndex = 0;
    this.loadInvoices();
  }

  getStatusClass(status: InvoiceStatus): string {
    const statusClasses = {
      [InvoiceStatus.DRAFT]: 'status-draft',
      [InvoiceStatus.PENDING]: 'status-pending',
      [InvoiceStatus.SENT]: 'status-sent',
      [InvoiceStatus.PAID]: 'status-paid',
      [InvoiceStatus.OVERDUE]: 'status-overdue',
      [InvoiceStatus.CANCELLED]: 'status-cancelled'
    };
    return statusClasses[status] || '';
  }

  getStatusLabel(status: InvoiceStatus): string {
    return this.invoiceService.getStatusLabel(status);
  }

  markAsSent(invoice: Invoice): void {
    if (!invoice.id) return;
    
    this.invoiceService.markInvoiceAsSent(invoice.id)
      .subscribe({
        next: (updatedInvoice) => {
          const index = this.invoices.findIndex(i => i.id === invoice.id);
          if (index !== -1) {
            this.invoices[index] = updatedInvoice;
          }
          this.showSuccess('Facture marquée comme envoyée');
        },
        error: (error) => {
          console.error('Error marking invoice as sent:', error);
          this.showError('Erreur lors de la mise à jour');
        }
      });
  }

  markAsPaid(invoice: Invoice): void {
    if (!invoice.id) return;
    
    this.invoiceService.markInvoiceAsPaid(invoice.id)
      .subscribe({
        next: (updatedInvoice) => {
          const index = this.invoices.findIndex(i => i.id === invoice.id);
          if (index !== -1) {
            this.invoices[index] = updatedInvoice;
          }
          this.showSuccess('Facture marquée comme payée');
        },
        error: (error) => {
          console.error('Error marking invoice as paid:', error);
          this.showError('Erreur lors de la mise à jour');
        }
      });
  }

  cancelInvoice(invoice: Invoice): void {
    if (!invoice.id) return;
    
    if (confirm('Êtes-vous sûr de vouloir annuler cette facture ?')) {
      this.invoiceService.cancelInvoice(invoice.id)
        .subscribe({
          next: (updatedInvoice) => {
            const index = this.invoices.findIndex(i => i.id === invoice.id);
            if (index !== -1) {
              this.invoices[index] = updatedInvoice;
            }
            this.showSuccess('Facture annulée');
          },
          error: (error) => {
            console.error('Error cancelling invoice:', error);
            this.showError('Erreur lors de l\'annulation');
          }
        });
    }
  }

  downloadPDF(invoice: Invoice): void {
    if (!invoice.id || !invoice.invoiceNumber) return;
    
    // TODO: Fix download method
    console.log('Download requested for invoice:', invoice.id, invoice.invoiceNumber);
  }

  sendByEmail(invoice: Invoice): void {
    if (!invoice.id || !invoice.clientEmail) return;
    
    this.invoiceService.sendInvoiceByEmail(invoice.id, invoice.clientEmail)
      .subscribe({
        next: (response) => {
          if (response.status === 'success') {
            this.showSuccess('Facture envoyée par email');
          } else {
            this.showError('Erreur lors de l\'envoi');
          }
        },
        error: (error) => {
          console.error('Error sending invoice by email:', error);
          this.showError('Erreur lors de l\'envoi par email');
        }
      });
  }

  deleteInvoice(invoice: Invoice): void {
    if (!invoice.id) return;
    
    if (confirm('Êtes-vous sûr de vouloir supprimer cette facture ?')) {
      this.invoiceService.deleteInvoice(invoice.id)
        .subscribe({
          next: () => {
            this.invoices = this.invoices.filter(i => i.id !== invoice.id);
            this.showSuccess('Facture supprimée');
          },
          error: (error) => {
            console.error('Error deleting invoice:', error);
            this.showError('Erreur lors de la suppression');
          }
        });
    }
  }

  formatDate(date: Date | string): string {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleDateString('fr-FR');
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  }

  private showSuccess(message: string): void {
    this.snackBar.open(message, 'Fermer', {
      duration: 3000,
      panelClass: ['success-snackbar']
    });
  }

  private showError(message: string): void {
    this.snackBar.open(message, 'Fermer', {
      duration: 5000,
      panelClass: ['error-snackbar']
    });
  }
}
