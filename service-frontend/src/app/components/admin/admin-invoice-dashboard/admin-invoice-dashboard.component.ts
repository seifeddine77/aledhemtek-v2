import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatGridListModule } from '@angular/material/grid-list';

import { AdminInvoiceService, InvoiceStats } from '../../../services/admin-invoice.service';

@Component({
  selector: 'app-admin-invoice-dashboard',
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
  templateUrl: './admin-invoice-dashboard.component.html',
  styleUrl: './admin-invoice-dashboard.component.css'
})
export class AdminInvoiceDashboardComponent implements OnInit {
  stats: InvoiceStats | null = null;
  loading = true;
  error: string | null = null;

  constructor(
    private adminInvoiceService: AdminInvoiceService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadStatistics();
  }

  /**
   * Load invoice statistics
   */
  loadStatistics(): void {
    this.loading = true;
    this.error = null;

    this.adminInvoiceService.getInvoiceStats().subscribe({
      next: (stats) => {
        console.log('Dashboard stats loaded:', stats);
        this.stats = stats;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading dashboard stats:', error);
        this.error = 'Erreur lors du chargement des statistiques';
        this.loading = false;
        this.showError('Erreur lors du chargement des statistiques');
      }
    });
  }

  /**
   * Navigate to full invoice management
   */
  goToInvoices(): void {
    this.router.navigate(['/admin/invoices']);
  }

  /**
   * Refresh statistics
   */
  refresh(): void {
    this.loadStatistics();
  }

  /**
   * Calculate recovery rate percentage
   */
  getRecoveryRate(): number {
    if (!this.stats || this.stats.totalAmount === 0) {
      return 0;
    }
    return (this.stats.paidAmount / this.stats.totalAmount) * 100;
  }

  /**
   * Get average invoice amount
   */
  getAverageAmount(): number {
    if (!this.stats || this.stats.totalInvoices === 0) {
      return 0;
    }
    return this.stats.totalAmount / this.stats.totalInvoices;
  }

  /**
   * Format currency
   */
  formatCurrency(amount: number): string {
    return this.adminInvoiceService.formatCurrency(amount);
  }

  /**
   * Format percentage
   */
  formatPercentage(value: number): string {
    return `${value.toFixed(1)}%`;
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
}
