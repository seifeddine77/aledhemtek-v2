import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';

import { cleanText } from '../../../pipes/clean-text.pipe';

export interface MaterialData {
  name: string;
  quantity: number;
}

@Component({
  selector: 'app-material-dialog',
  template: `
    <div class="dialog-modern-container">
      <div class="dialog-modern-header">
        <div class="dialog-header-badge">
          <mat-icon>handyman</mat-icon>
        </div>
        <div class="dialog-header-text">
          <h2>Ajouter un matériau</h2>
          <p>Indiquez la fourniture ou l'outil requis pour cette tâche</p>
        </div>
      </div>

      <div class="dialog-modern-body">
        <mat-form-field appearance="outline" class="w-100">
          <mat-label>Désignation du matériau</mat-label>
          <mat-icon matPrefix>inventory</mat-icon>
          <input matInput [(ngModel)]="data.name" name="name" placeholder="Ex: Joint en silicone, Disjoncteur 16A..." required autofocus>
          <mat-error *ngIf="!data.name">Le nom est requis</mat-error>
        </mat-form-field>

        <mat-form-field appearance="outline" class="w-100">
          <mat-label>Quantité requise</mat-label>
          <mat-icon matPrefix>format_list_numbered</mat-icon>
          <input matInput type="number" [(ngModel)]="data.quantity" name="quantity" required min="1" placeholder="Ex: 2">
          <mat-error *ngIf="!data.quantity || data.quantity < 1">La quantité minimale est 1</mat-error>
        </mat-form-field>
      </div>

      <div class="dialog-modern-actions">
        <button mat-button (click)="onNoClick()" class="btn-cancel">
          Annuler
        </button>
        <button mat-raised-button color="primary" [mat-dialog-close]="data" [disabled]="!data.name || !data.quantity || data.quantity <= 0" class="btn-primary">
          <mat-icon>add</mat-icon>
          Ajouter le matériau
        </button>
      </div>
    </div>
  `,
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
      background: rgba(16, 185, 129, 0.1);
      color: #059669;
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
    }
  `],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule
  ]
})
export class MaterialDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<MaterialDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: MaterialData
  ) {
    if (this.data) {
      this.data.name = cleanText(this.data.name || '');
    }
  }

  onNoClick(): void {
    this.dialogRef.close();
  }
}
