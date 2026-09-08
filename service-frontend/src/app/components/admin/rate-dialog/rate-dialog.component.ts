import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { RateDto } from '../../../services/task.service';

@Component({
  selector: 'app-rate-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatDatepickerModule,
    MatNativeDateModule
  ],
  template: `
    <div class="dialog-modern-container">
      <div class="dialog-modern-header">
        <div class="dialog-header-badge">
          <mat-icon>payments</mat-icon>
        </div>
        <div class="dialog-header-text">
          <h2>{{data.rate ? 'Modifier le tarif' : 'Ajouter un nouveau tarif'}}</h2>
          <p>Indiquez le montant horaire ou forfaitaire et la période d'application</p>
        </div>
      </div>
      
      <div class="dialog-modern-body">
        <form [formGroup]="rateForm" class="rate-form">
          <mat-form-field appearance="outline" class="w-100">
            <mat-label>Prix HT (€)</mat-label>
            <mat-icon matPrefix>attach_money</mat-icon>
            <input matInput type="number" formControlName="price" 
                   placeholder="Ex: 45.00" step="0.5" min="0">
            <span matSuffix class="field-currency">EUR</span>
            <mat-error *ngIf="rateForm.get('price')?.hasError('required')">
              Le prix est obligatoire
            </mat-error>
            <mat-error *ngIf="rateForm.get('price')?.hasError('min')">
              Le prix doit être positif
            </mat-error>
          </mat-form-field>

          <div class="dates-grid">
            <mat-form-field appearance="outline" class="w-100">
              <mat-label>Date d'effet</mat-label>
              <input matInput [matDatepicker]="startPicker" formControlName="startDate" placeholder="JJ/MM/AAAA">
              <mat-datepicker-toggle matSuffix [for]="startPicker"></mat-datepicker-toggle>
              <mat-datepicker #startPicker></mat-datepicker>
              <mat-error *ngIf="rateForm.get('startDate')?.hasError('required')">
                La date de début est requise
              </mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline" class="w-100">
              <mat-label>Date d'expiration (optionnelle)</mat-label>
              <input matInput [matDatepicker]="endPicker" formControlName="endDate" placeholder="JJ/MM/AAAA">
              <mat-datepicker-toggle matSuffix [for]="endPicker"></mat-datepicker-toggle>
              <mat-datepicker #endPicker></mat-datepicker>
              <mat-hint>Vide = durée indéterminée</mat-hint>
              <mat-error *ngIf="rateForm.get('endDate')?.hasError('dateOrder')">
                La date de fin doit être postérieure au début
              </mat-error>
            </mat-form-field>
          </div>
        </form>
      </div>

      <div class="dialog-modern-actions">
        <button mat-button (click)="onCancel()" class="btn-cancel">Annuler</button>
        <button mat-raised-button color="primary" 
                (click)="onSave()" 
                [disabled]="rateForm.invalid || saving" class="btn-primary">
          <mat-icon *ngIf="saving">hourglass_empty</mat-icon>
          <mat-icon *ngIf="!saving">check</mat-icon>
          {{saving ? 'Enregistrement...' : (data.rate ? 'Mettre à jour' : 'Ajouter le tarif')}}
        </button>
      </div>
    </div>
  `,
  styles: [`
    .dialog-modern-container {
      padding: 1.5rem;
      min-width: 420px;
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
    }
    .rate-form {
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
  `]
})
export class RateDialogComponent implements OnInit {
  rateForm: FormGroup;
  saving = false;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<RateDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { rate?: RateDto }
  ) {
    this.rateForm = this.fb.group({
      price: [data.rate?.price || '', [Validators.required, Validators.min(0)]],
      startDate: [data.rate?.startDate || new Date(), [Validators.required]],
      endDate: [data.rate?.endDate || null]
    });
  }

  ngOnInit(): void {
    this.rateForm.get('endDate')?.valueChanges.subscribe(() => {
      this.validateDates();
    });
    
    this.rateForm.get('startDate')?.valueChanges.subscribe(() => {
      this.validateDates();
    });
  }

  validateDates(): void {
    const startDate = this.rateForm.get('startDate')?.value;
    const endDate = this.rateForm.get('endDate')?.value;
    
    if (startDate && endDate && new Date(endDate) <= new Date(startDate)) {
      this.rateForm.get('endDate')?.setErrors({ 'dateOrder': true });
    } else if (this.rateForm.get('endDate')?.hasError('dateOrder')) {
      this.rateForm.get('endDate')?.setErrors(null);
    }
  }

  onSave(): void {
    if (this.rateForm.valid) {
      this.saving = true;
      
      const rateData: RateDto = {
        ...this.data.rate,
        ...this.rateForm.value
      };

      this.dialogRef.close(rateData);
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
