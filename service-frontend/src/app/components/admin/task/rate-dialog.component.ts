import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';

export interface RateData {
  price: number | null;
  startDate: Date | null;
  endDate: Date | null;
}

@Component({
  selector: 'app-rate-dialog',
  standalone: true,
  templateUrl: './rate-dialog.component.html',
  styles: [`
    .dialog-modern-container {
      padding: 1.5rem;
      min-width: 380px;
    }
    .dialog-modern-header {
      display: flex;
      align-items: center;
      gap: 1rem;
      margin-bottom: 1.5rem;
      padding-bottom: 1rem;
      border-bottom: 1px solid var(--color-border, #e2e8f0);
    }
    .dialog-header-badge {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 44px;
      height: 44px;
      border-radius: 10px;
      background: rgba(37, 99, 235, 0.1);
      color: var(--color-primary, #2563eb);
    }
    .dialog-header-text h2 {
      margin: 0;
      font-size: 1.25rem;
      font-weight: 700;
      color: var(--color-text-primary, #0f172a);
    }
    .dialog-header-text p {
      margin: 0.25rem 0 0;
      font-size: 0.85rem;
      color: var(--color-text-secondary, #64748b);
    }
    .dialog-modern-body {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }
    .dates-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 0.75rem;
    }
    .field-currency {
      font-size: 0.85rem;
      font-weight: 600;
      color: var(--color-text-muted, #64748b);
      margin-right: 8px;
    }
    .dialog-modern-actions {
      display: flex;
      justify-content: flex-end;
      align-items: center;
      gap: 0.85rem;
      margin-top: 1.5rem;
      padding-top: 1.15rem;
      border-top: 1px solid var(--color-border, #e2e8f0);
    }
    .btn-cancel {
      border: 1px solid #cbd5e1;
      border-radius: 8px;
      font-weight: 500;
      color: #475569;
      padding: 0 1.25rem;
      height: 40px;
    }
    .btn-primary {
      border-radius: 8px;
      font-weight: 600;
      box-shadow: 0 2px 4px rgba(37, 99, 235, 0.2);
      padding: 0 1.5rem;
      height: 40px;
    }
    .w-100 {
      width: 100%;
    }
    @media (max-width: 480px) {
      .dialog-modern-container {
        min-width: 100%;
        padding: 1rem;
      }
      .dates-grid {
        grid-template-columns: 1fr;
      }
    }
  `],
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatDialogModule
  ]
})
export class RateDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<RateDialogComponent, RateData>,
    @Inject(MAT_DIALOG_DATA) public data: RateData
  ) {}
}
