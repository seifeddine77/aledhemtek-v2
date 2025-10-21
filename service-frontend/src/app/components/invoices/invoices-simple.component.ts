import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { InvoiceService } from '../../services/invoice.service';
import { Invoice, InvoiceStatus } from '../../models/invoice.model';

@Component({
  selector: 'app-invoices-simple',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatSnackBarModule
  ],
  template: `
    <div class="invoices-container">
      <mat-card>
        <mat-card-header>
          <mat-card-title>Gestion des Factures</mat-card-title>
          <div class="header-actions">
            <button mat-raised-button color="primary" (click)="createInvoice()">
              <mat-icon>add</mat-icon>
              Nouvelle Facture
            </button>
          </div>
        </mat-card-header>

        <mat-card-content>
          <div *ngIf="loading" class="loading-container">
            <mat-spinner></mat-spinner>
            <p>Chargement des factures...</p>
          </div>

          <div *ngIf="!loading && invoices.length === 0" class="empty-state">
            <mat-icon>receipt_long</mat-icon>
            <h3>Aucune facture trouvée</h3>
            <p>Commencez par créer votre première facture</p>
            <button mat-raised-button color="primary" (click)="createInvoice()">
              Créer une facture
            </button>
          </div>

          <div *ngIf="!loading && invoices.length > 0">
            <table mat-table [dataSource]="invoices" class="invoices-table">
              <!-- Invoice Number Column -->
              <ng-container matColumnDef="invoiceNumber">
                <th mat-header-cell *matHeaderCellDef>Numéro</th>
                <td mat-cell *matCellDef="let invoice">{{invoice.invoiceNumber}}</td>
              </ng-container>

              <!-- Client Column -->
              <ng-container matColumnDef="client">
                <th mat-header-cell *matHeaderCellDef>Client</th>
                <td mat-cell *matCellDef="let invoice">{{invoice.clientName || 'Client #' + invoice.clientId}}</td>
              </ng-container>

              <!-- Issue Date Column -->
              <ng-container matColumnDef="issueDate">
                <th mat-header-cell *matHeaderCellDef>Date d'émission</th>
                <td mat-cell *matCellDef="let invoice">{{formatDate(invoice.issueDate)}}</td>
              </ng-container>

              <!-- Due Date Column -->
              <ng-container matColumnDef="dueDate">
                <th mat-header-cell *matHeaderCellDef>Date d'échéance</th>
                <td mat-cell *matCellDef="let invoice">{{formatDate(invoice.dueDate)}}</td>
              </ng-container>

              <!-- Total Amount Column -->
              <ng-container matColumnDef="totalAmount">
                <th mat-header-cell *matHeaderCellDef>Montant</th>
                <td mat-cell *matCellDef="let invoice">{{invoice.totalAmount | currency:'EUR':'symbol':'1.2-2'}}</td>
              </ng-container>

              <!-- Status Column -->
              <ng-container matColumnDef="status">
                <th mat-header-cell *matHeaderCellDef>Statut</th>
                <td mat-cell *matCellDef="let invoice">
                  <mat-chip [style.background-color]="getStatusColor(invoice.status)" class="status-chip">
                    {{getStatusLabel(invoice.status)}}
                  </mat-chip>
                </td>
              </ng-container>

              <!-- Actions Column -->
              <ng-container matColumnDef="actions">
                <th mat-header-cell *matHeaderCellDef>Actions</th>
                <td mat-cell *matCellDef="let invoice">
                  <button mat-icon-button (click)="viewInvoice(invoice.id)" matTooltip="Voir les détails">
                    <mat-icon>visibility</mat-icon>
                  </button>
                  <button mat-icon-button (click)="editInvoice(invoice.id)" matTooltip="Modifier">
                    <mat-icon>edit</mat-icon>
                  </button>
                  <button mat-icon-button (click)="downloadPDF(invoice)" matTooltip="Télécharger PDF">
                    <mat-icon>download</mat-icon>
                  </button>
                </td>
              </ng-container>

              <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
              <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
            </table>
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .invoices-container {
      padding: 20px;
      max-width: 1200px;
      margin: 0 auto;
    }

    .header-actions {
      margin-left: auto;
    }

    .loading-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 40px;
    }

    .empty-state {
      text-align: center;
      padding: 40px;
    }

    .empty-state mat-icon {
      font-size: 64px;
      width: 64px;
      height: 64px;
      color: #ccc;
    }

    .invoices-table {
      width: 100%;
      margin-top: 20px;
    }

    .status-chip {
      color: white;
      font-weight: 500;
    }

    mat-card-header {
      display: flex;
      align-items: center;
    }
  `]
})
export class InvoicesSimpleComponent implements OnInit {
  invoices: Invoice[] = [];
  loading = true;
  displayedColumns: string[] = ['invoiceNumber', 'client', 'issueDate', 'dueDate', 'totalAmount', 'status', 'actions'];

  constructor(
    private invoiceService: InvoiceService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadInvoices();
  }

  loadInvoices(): void {
    this.loading = true;
    this.invoiceService.getAllInvoices().subscribe({
      next: (invoices) => {
        this.invoices = invoices;
        this.loading = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des factures:', error);
        this.snackBar.open('Erreur lors du chargement des factures', 'Fermer', { duration: 3000 });
        this.loading = false;
      }
    });
  }

  createInvoice(): void {
    this.router.navigate(['/admin/invoices/create']);
  }

  viewInvoice(id: number): void {
    this.router.navigate(['/admin/invoices', id]);
  }

  editInvoice(id: number): void {
    this.router.navigate(['/admin/invoices', id, 'edit']);
  }

  downloadPDF(invoice: Invoice): void {
    if (invoice.id) {
      this.invoiceService.downloadAndSaveInvoicePDF(invoice.id!, invoice.invoiceNumber!);
    }
  }

  formatDate(dateString: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR');
  }

  getStatusLabel(status: InvoiceStatus): string {
    return this.invoiceService.getStatusLabel(status);
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
}
