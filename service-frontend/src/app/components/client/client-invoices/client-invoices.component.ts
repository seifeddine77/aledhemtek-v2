import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

// Angular Material Imports
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';

// Services
import { ClientInvoiceService, ClientInvoice, InvoiceStatus, ClientInvoiceStats } from '../../../services/client-invoice.service';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-client-invoices',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatProgressBarModule,
    MatTooltipModule,
    MatDividerModule
  ],
  templateUrl: './client-invoices.component.html',
  styleUrls: ['./client-invoices.component.css']
})
export class ClientInvoicesComponent implements OnInit {
  // Data Properties
  invoices: ClientInvoice[] = [];
  filteredInvoices: ClientInvoice[] = [];
  stats: ClientInvoiceStats | null = null;
  
  // UI State
  loading = false;
  error: string | null = null;
  
  // Filters
  selectedStatus = 'ALL';
  searchTerm = '';
  
  // Table Configuration
  displayedColumns: string[] = [
    'invoiceNumber', 
    'issueDate', 
    'dueDate', 
    'totalAmount', 
    'paidAmount',
    'status', 
    'actions'
  ];

  // Status Options for Filter
  statusOptions = [
    { value: 'ALL', label: 'Tous les statuts' },
    { value: InvoiceStatus.PENDING, label: 'En attente' },
    { value: InvoiceStatus.SENT, label: 'Envoyées' },
    { value: InvoiceStatus.PAID, label: 'Payées' },
    { value: InvoiceStatus.OVERDUE, label: 'En retard' }
  ];

  // Expose enum to template
  InvoiceStatus = InvoiceStatus;

  constructor(
    private clientInvoiceService: ClientInvoiceService,
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    // Check if user is authenticated as CLIENT
    const isLoggedIn = this.authService.isLoggedIn();
    const userRole = this.authService.getRole();
    const userId = this.authService.getCurrentUserId();
    
    console.log('Is logged in:', isLoggedIn);
    console.log('User role:', userRole);
    console.log('User ID:', userId);
    
    if (!isLoggedIn || userRole !== 'client') {
      console.error('User is not authenticated as CLIENT');
      this.error = 'Vous devez être connecté en tant que client pour accéder à cette page';
      return;
    }
    
    this.loadInvoices();
    this.loadStats();
  }

  loadInvoices(): void {
    this.loading = true;
    this.error = null;

    this.clientInvoiceService.getMyInvoices().subscribe({
      next: (invoices) => {
        console.log('Received invoices:', invoices);
        // Ensure we have an array
        this.invoices = Array.isArray(invoices) ? invoices : [];
        this.applyFilters();
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading invoices:', error);
        this.error = 'Erreur lors du chargement des factures';
        this.loading = false;
        this.showErrorSnackbar('Erreur lors du chargement des factures');
      }
    });
  }

  loadStats(): void {
    this.clientInvoiceService.getClientInvoiceStats().subscribe({
      next: (stats) => {
        this.stats = stats;
      },
      error: (error) => {
        console.error('Error loading stats:', error);
      }
    });
  }

  applyFilters(): void {
    // Safety check to ensure invoices is an array
    if (!Array.isArray(this.invoices)) {
      console.warn('Invoices is not an array:', this.invoices);
      this.invoices = [];
    }
    
    this.filteredInvoices = this.invoices.filter(invoice => {
      const matchesStatus = this.selectedStatus === 'ALL' || invoice.status === this.selectedStatus;
      const matchesSearch = this.searchTerm === '' || 
        invoice.invoiceNumber.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        (invoice.reservation?.title || '').toLowerCase().includes(this.searchTerm.toLowerCase());
      
      return matchesStatus && matchesSearch;
    });
  }

  onStatusChange(): void {
    this.applyFilters();
  }

  onSearchChange(): void {
    this.applyFilters();
  }

  refreshData(): void {
    this.loadInvoices();
    this.loadStats();
  }

  // Action Methods
  viewInvoiceDetail(invoice: ClientInvoice): void {
    this.router.navigate(['/client/invoices', invoice.id]);
  }

  downloadPDF(invoice: ClientInvoice): void {
    if (!this.clientInvoiceService.isDownloadable(invoice)) {
      this.showErrorSnackbar('Le téléchargement n\'est pas disponible pour cette facture');
      return;
    }

    this.clientInvoiceService.downloadInvoicePDF(invoice.id).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `Facture_${invoice.invoiceNumber}.pdf`;
        link.click();
        window.URL.revokeObjectURL(url);
        
        this.showSuccessSnackbar('Facture téléchargée avec succès');
      },
      error: (error) => {
        console.error('Error downloading PDF:', error);
        this.showErrorSnackbar('Erreur lors du téléchargement du PDF');
      }
    });
  }

  payInvoice(invoice: ClientInvoice): void {
    if (!this.clientInvoiceService.isPayable(invoice)) {
      this.showErrorSnackbar('Cette facture ne peut pas être payée actuellement');
      return;
    }
    
    // Navigate to payment page
    this.router.navigate(['/client/invoices', invoice.id, 'payment']);
  }

  // Utility Methods
  formatCurrency(amount: number): string {
    return this.clientInvoiceService.formatCurrency(amount);
  }

  formatDate(dateString: string): string {
    return this.clientInvoiceService.formatDate(dateString);
  }

  getStatusText(status: InvoiceStatus): string {
    return this.clientInvoiceService.getStatusText(status);
  }

  getStatusColor(status: InvoiceStatus): string {
    return this.clientInvoiceService.getStatusColor(status);
  }

  isPayable(invoice: ClientInvoice): boolean {
    return this.clientInvoiceService.isPayable(invoice);
  }

  isDownloadable(invoice: ClientInvoice): boolean {
    return this.clientInvoiceService.isDownloadable(invoice);
  }

  getPaymentProgress(invoice: ClientInvoice): number {
    return this.clientInvoiceService.calculateProgress(invoice);
  }

  getProgressBarColor(progress: number): string {
    if (progress >= 100) return 'primary';
    if (progress >= 50) return 'accent';
    return 'warn';
  }

  // Snackbar Methods
  private showSuccessSnackbar(message: string): void {
    this.snackBar.open(message, 'Fermer', {
      duration: 3000,
      panelClass: ['success-snackbar']
    });
  }

  private showErrorSnackbar(message: string): void {
    this.snackBar.open(message, 'Fermer', {
      duration: 5000,
      panelClass: ['error-snackbar']
    });
  }

  // Stats Calculations for Template
  getRecoveryRate(): number {
    if (!this.stats || this.stats.totalAmount === 0) return 0;
    return Math.round((this.stats.paidAmount / this.stats.totalAmount) * 100);
  }

  getOverdueCount(): number {
    return this.stats?.statusCounts[InvoiceStatus.OVERDUE] || 0;
  }

  getPaidCount(): number {
    return this.stats?.statusCounts[InvoiceStatus.PAID] || 0;
  }

  getPendingCount(): number {
    return (this.stats?.statusCounts[InvoiceStatus.PENDING] || 0) + 
           (this.stats?.statusCounts[InvoiceStatus.SENT] || 0);
  }
}
