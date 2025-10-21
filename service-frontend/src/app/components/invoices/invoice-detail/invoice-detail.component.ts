import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatMenuModule } from '@angular/material/menu';

import { InvoiceService } from '../../../services/invoice.service';
import { Invoice, InvoiceItem, Payment, InvoiceStatus, PaymentMethod } from '../../../models/invoice.model';
import { PaymentDialogComponent } from '../payment-dialog/payment-dialog.component';

@Component({
  selector: 'app-invoice-detail',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatChipsModule,
    MatDividerModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatDialogModule,
    MatMenuModule
  ],
  templateUrl: './invoice-detail.component.html',
  styleUrls: ['./invoice-detail.component.css']
})
export class InvoiceDetailComponent implements OnInit {
  invoice: Invoice | null = null;
  loading = true;
  invoiceId!: number;
  
  displayedColumns: string[] = ['designation', 'description', 'quantity', 'unitPrice', 'taxRate', 'totalPrice'];
  paymentColumns: string[] = ['paymentReference', 'amount', 'paymentDate', 'paymentMethod', 'status', 'actions'];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private invoiceService: InvoiceService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.invoiceId = +params['id'];
      this.loadInvoice();
    });
  }

  loadInvoice(): void {
    this.loading = true;
    this.invoiceService.getInvoiceById(this.invoiceId).subscribe({
      next: (invoice: any) => {
        // Assigner la facture avec des valeurs par défaut si nécessaire
        this.invoice = {
          ...invoice,
          clientId: invoice.clientId || 0,
          invoiceItems: invoice.invoiceItems || [],
          payments: invoice.payments || []
        };
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading invoice:', error);
        this.snackBar.open('Erreur lors du chargement de la facture', 'Fermer', { duration: 3000 });
        this.loading = false;
      }
    });
  }

  getStatusColor(status: InvoiceStatus): string {
    switch (status) {
      case InvoiceStatus.DRAFT:
        return 'status-draft';
      case InvoiceStatus.PENDING:
        return 'status-pending';
      case InvoiceStatus.SENT:
        return 'status-sent';
      case InvoiceStatus.PAID:
        return 'status-paid';
      case InvoiceStatus.OVERDUE:
        return 'status-overdue';
      case InvoiceStatus.CANCELLED:
        return 'status-cancelled';
      default:
        return '';
    }
  }

  getStatusLabel(status: InvoiceStatus): string {
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

  getPaymentMethodLabel(method: PaymentMethod): string {
    switch (method) {
      case PaymentMethod.CASH:
        return 'Espèces';
      case PaymentMethod.CREDIT_CARD:
        return 'Carte bancaire';
      case PaymentMethod.BANK_TRANSFER:
        return 'Virement';
      case PaymentMethod.CHECK:
        return 'Chèque';
      case PaymentMethod.PAYPAL:
        return 'PayPal';
      case PaymentMethod.OTHER:
        return 'Autre';
      default:
        return method;
    }
  }

  calculateSubtotal(): number {
    if (!this.invoice?.invoiceItems) return 0;
    return this.invoice.invoiceItems.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
  }

  calculateTotalTax(): number {
    if (!this.invoice?.invoiceItems) return 0;
    return this.invoice.invoiceItems.reduce((sum, item) => {
      const itemTotal = item.quantity * item.unitPrice;
      return sum + (itemTotal * (item.taxRate || 0) / 100);
    }, 0);
  }

  calculateTotalPaid(): number {
    if (!this.invoice?.payments) return 0;
    return this.invoice.payments
      .filter(payment => payment.status === 'COMPLETED')
      .reduce((sum, payment) => sum + payment.amount, 0);
  }

  calculateRemainingAmount(): number {
    return this.invoice?.totalAmount ? this.invoice.totalAmount - this.calculateTotalPaid() : 0;
  }

  isFullyPaid(): boolean {
    return this.calculateRemainingAmount() <= 0;
  }

  canMarkAsSent(): boolean {
    return this.invoice?.status === InvoiceStatus.DRAFT || this.invoice?.status === InvoiceStatus.PENDING;
  }

  canMarkAsPaid(): boolean {
    return this.invoice?.status === InvoiceStatus.SENT || this.invoice?.status === InvoiceStatus.OVERDUE;
  }

  canCancel(): boolean {
    return this.invoice?.status !== InvoiceStatus.PAID && this.invoice?.status !== InvoiceStatus.CANCELLED;
  }

  markAsSent(): void {
    if (!this.invoice) return;
    
    this.invoiceService.markInvoiceAsSent(this.invoice.id!).subscribe({
      next: () => {
        this.snackBar.open('Facture marquée comme envoyée', 'Fermer', { 
          duration: 3000,
          panelClass: ['success-snackbar']
        });
        this.loadInvoice();
      },
      error: (error) => {
        console.error('Error marking invoice as sent:', error);
        this.snackBar.open('Erreur lors de la mise à jour', 'Fermer', { 
          duration: 3000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }

  markAsPaid(): void {
    if (!this.invoice) return;
    
    this.invoiceService.markInvoiceAsPaid(this.invoice.id!).subscribe({
      next: () => {
        this.snackBar.open('Facture marquée comme payée', 'Fermer', { 
          duration: 3000,
          panelClass: ['success-snackbar']
        });
        this.loadInvoice();
      },
      error: (error) => {
        console.error('Error marking invoice as paid:', error);
        this.snackBar.open('Erreur lors de la mise à jour', 'Fermer', { 
          duration: 3000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }

  cancelInvoice(): void {
    if (!this.invoice) return;
    
    if (confirm('Êtes-vous sûr de vouloir annuler cette facture ?')) {
      this.invoiceService.cancelInvoice(this.invoice.id!).subscribe({
        next: () => {
          this.snackBar.open('Facture annulée', 'Fermer', { 
            duration: 3000,
            panelClass: ['success-snackbar']
          });
          this.loadInvoice();
        },
        error: (error) => {
          console.error('Error cancelling invoice:', error);
          this.snackBar.open('Erreur lors de l\'annulation', 'Fermer', { 
            duration: 3000,
            panelClass: ['error-snackbar']
          });
        }
      });
    }
  }

  downloadPDF(): void {
    if (!this.invoice) return;
    
    this.invoiceService.downloadInvoicePDF(this.invoice.id!).subscribe({
      next: (blob: Blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `facture-${this.invoice!.invoiceNumber}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      },
      error: (error: any) => {
        console.error('Error downloading PDF:', error);
        this.snackBar.open('Erreur lors du téléchargement du PDF', 'Fermer', { 
          duration: 3000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }

  sendByEmail(): void {
    if (!this.invoice) return;
    
    // Utiliser l'email du client ou demander à l'utilisateur
    const clientEmail = this.invoice.clientEmail || 'client@example.com';
    this.invoiceService.sendInvoiceByEmail(this.invoice.id!, clientEmail).subscribe({
      next: () => {
        this.snackBar.open('Facture envoyée par email', 'Fermer', { 
          duration: 3000,
          panelClass: ['success-snackbar']
        });
      },
      error: (error) => {
        console.error('Error sending email:', error);
        this.snackBar.open('Erreur lors de l\'envoi de l\'email', 'Fermer', { 
          duration: 3000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }

  addPayment(): void {
    if (!this.invoice) return;

    const dialogRef = this.dialog.open(PaymentDialogComponent, {
      width: '500px',
      data: { 
        invoiceId: this.invoice.id,
        remainingAmount: this.calculateRemainingAmount()
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadInvoice();
      }
    });
  }

  deletePayment(paymentId: number): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce paiement ?')) {
      this.invoiceService.deletePayment(paymentId).subscribe({
        next: () => {
          this.snackBar.open('Paiement supprimé', 'Fermer', { 
            duration: 3000,
            panelClass: ['success-snackbar']
          });
          this.loadInvoice();
        },
        error: (error) => {
          console.error('Error deleting payment:', error);
          this.snackBar.open('Erreur lors de la suppression', 'Fermer', { 
            duration: 3000,
            panelClass: ['error-snackbar']
          });
        }
      });
    }
  }

  goBack(): void {
    this.router.navigate(['/admin/invoices']);
  }

  editInvoice(): void {
    this.router.navigate(['/admin/invoices', this.invoiceId, 'edit']);
  }
}
