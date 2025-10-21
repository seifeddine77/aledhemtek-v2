import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatGridListModule } from '@angular/material/grid-list';

import { InvoiceService } from '../../../services/invoice.service';
import { InvoiceStatistics, InvoiceStatus } from '../../../models/invoice.model';

@Component({
  selector: 'app-invoice-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatGridListModule
  ],
  templateUrl: './invoice-dashboard.component.html',
  styleUrls: ['./invoice-dashboard.component.css']
})
export class InvoiceDashboardComponent implements OnInit {
  // Expose enum for template
  InvoiceStatus = InvoiceStatus;

  statistics: InvoiceStatistics | null = null;
  loading = true;
  error: string | null = null;

  constructor(
    private invoiceService: InvoiceService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadStatistics();
  }

  loadStatistics(): void {
    this.loading = true;
    this.invoiceService.getInvoiceStatistics().subscribe({
      next: (stats: any) => {
        // Assigner les statistiques avec des valeurs par défaut si nécessaire
        this.statistics = {
          totalInvoices: stats.totalInvoices || 0,
          totalAmount: stats.totalAmount || 0,
          paidAmount: stats.paidAmount || 0,
          pendingAmount: stats.pendingAmount || 0,
          overdueAmount: stats.overdueAmount || 0,
          averageAmount: stats.averageAmount || 0,
          statusDistribution: stats.statusDistribution || {}
        };
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading statistics:', error);
        this.snackBar.open('Erreur lors du chargement des statistiques', 'Fermer', { duration: 3000 });
        this.loading = false;
      }
    });
  }

  navigateToInvoices(): void {
    this.router.navigate(['/admin/invoices']);
  }

  navigateToCreateInvoice(): void {
    this.router.navigate(['/admin/invoices/create']);
  }

  navigateToInvoicesByStatus(status: InvoiceStatus): void {
    this.router.navigate(['/admin/invoices'], { queryParams: { status: status } });
  }

  getStatusLabel(status: InvoiceStatus): string {
    switch (status) {
      case InvoiceStatus.DRAFT:
        return 'Brouillons';
      case InvoiceStatus.PENDING:
        return 'En attente';
      case InvoiceStatus.SENT:
        return 'Envoyées';
      case InvoiceStatus.PAID:
        return 'Payées';
      case InvoiceStatus.OVERDUE:
        return 'En retard';
      case InvoiceStatus.CANCELLED:
        return 'Annulées';
      default:
        return status;
    }
  }

  getStatusIcon(status: InvoiceStatus): string {
    switch (status) {
      case InvoiceStatus.DRAFT:
        return 'draft';
      case InvoiceStatus.PENDING:
        return 'schedule';
      case InvoiceStatus.SENT:
        return 'send';
      case InvoiceStatus.PAID:
        return 'payment';
      case InvoiceStatus.OVERDUE:
        return 'warning';
      case InvoiceStatus.CANCELLED:
        return 'cancel';
      default:
        return 'description';
    }
  }

  getStatusColor(status: InvoiceStatus): string {
    switch (status) {
      case InvoiceStatus.DRAFT:
        return '#9e9e9e';
      case InvoiceStatus.PENDING:
        return '#ff9800';
      case InvoiceStatus.SENT:
        return '#2196f3';
      case InvoiceStatus.PAID:
        return '#4caf50';
      case InvoiceStatus.OVERDUE:
        return '#f44336';
      case InvoiceStatus.CANCELLED:
        return '#757575';
      default:
        return '#9e9e9e';
    }
  }

  calculateCollectionRate(): number {
    if (!this.statistics || this.statistics.totalAmount === 0) return 0;
    return (this.statistics.paidAmount / this.statistics.totalAmount) * 100;
  }

  calculateOverdueRate(): number {
    if (!this.statistics || this.statistics.totalInvoices === 0) return 0;
    const overdueCount = this.statistics.statusDistribution[InvoiceStatus.OVERDUE] || 0;
    return (overdueCount / this.statistics.totalInvoices) * 100;
  }

  getStatusKeys(): InvoiceStatus[] {
    return Object.values(InvoiceStatus);
  }

  getStatusCount(status: InvoiceStatus): number {
    if (!this.statistics?.statusDistribution) return 0;
    return this.statistics.statusDistribution[status] || 0;
  }
}
