import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';

// Angular Material Imports
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatDividerModule } from '@angular/material/divider';
import { MatTableModule } from '@angular/material/table';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTooltipModule } from '@angular/material/tooltip';

// Services
import { ClientInvoiceService, ClientInvoice, InvoiceStatus } from '../../../services/client-invoice.service';

@Component({
  selector: 'app-client-invoice-detail',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatDividerModule,
    MatTableModule,
    MatProgressBarModule,
    MatTooltipModule
  ],
  templateUrl: './client-invoice-detail.component.html',
  styleUrls: ['./client-invoice-detail.component.css']
})
export class ClientInvoiceDetailComponent implements OnInit {
  invoice: ClientInvoice | null = null;
  loading = false;
  error: string | null = null;
  invoiceId: number = 0;

  // Table columns for items and payments
  itemColumns: string[] = ['description', 'quantity', 'unitPrice', 'totalPrice'];
  paymentColumns: string[] = ['paymentDate', 'amount', 'paymentMethod', 'transactionId'];

  // Expose enum to template
  InvoiceStatus = InvoiceStatus;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private clientInvoiceService: ClientInvoiceService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.invoiceId = +params['id'];
      if (this.invoiceId) {
        this.loadInvoiceDetail();
      }
    });
  }

  loadInvoiceDetail(): void {
    this.loading = true;
    this.error = null;

    this.clientInvoiceService.getInvoiceById(this.invoiceId).subscribe({
      next: (invoice) => {
        this.invoice = invoice;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading invoice detail:', error);
        this.error = 'Erreur lors du chargement des détails de la facture';
        this.loading = false;
        this.showErrorSnackbar('Erreur lors du chargement des détails de la facture');
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/client/invoices']);
  }

  downloadPDF(): void {
    if (!this.invoice || !this.clientInvoiceService.isDownloadable(this.invoice)) {
      this.showErrorSnackbar('Le téléchargement n\'est pas disponible pour cette facture');
      return;
    }

    this.clientInvoiceService.downloadInvoicePDF(this.invoice.id).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `Facture_${this.invoice!.invoiceNumber}.pdf`;
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

  payInvoice(): void {
    if (!this.invoice || !this.clientInvoiceService.isPayable(this.invoice)) {
      this.showErrorSnackbar('Cette facture ne peut pas être payée actuellement');
      return;
    }
    
    // Navigate to payment page
    this.router.navigate(['/client/invoices', this.invoice.id, 'payment']);
  }

  // Utility Methods
  formatCurrency(amount: number): string {
    return this.clientInvoiceService.formatCurrency(amount);
  }

  formatDate(dateString: string): string {
    return this.clientInvoiceService.formatDate(dateString);
  }

  formatDateTime(dateString: string): string {
    return this.clientInvoiceService.formatDateTime(dateString);
  }

  getStatusText(status: InvoiceStatus): string {
    return this.clientInvoiceService.getStatusText(status);
  }

  getStatusColor(status: InvoiceStatus): string {
    return this.clientInvoiceService.getStatusColor(status);
  }

  isPayable(): boolean {
    return this.invoice ? this.clientInvoiceService.isPayable(this.invoice) : false;
  }

  isDownloadable(): boolean {
    return this.invoice ? this.clientInvoiceService.isDownloadable(this.invoice) : false;
  }

  getPaymentProgress(): number {
    return this.invoice ? this.clientInvoiceService.calculateProgress(this.invoice) : 0;
  }

  getProgressBarColor(): string {
    const progress = this.getPaymentProgress();
    if (progress >= 100) return 'primary';
    if (progress >= 50) return 'accent';
    return 'warn';
  }

  getTotalPaidAmount(): number {
    if (!this.invoice || !this.invoice.payments) return 0;
    return this.invoice.payments.reduce((sum, payment) => sum + payment.amount, 0);
  }

  getRemainingAmount(): number {
    if (!this.invoice) return 0;
    return this.invoice.totalAmount - this.getTotalPaidAmount();
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
}
