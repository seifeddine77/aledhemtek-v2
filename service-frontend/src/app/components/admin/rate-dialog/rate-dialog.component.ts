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
    <h2 mat-dialog-title>{{data.rate ? 'Modifier le tarif' : 'Ajouter un tarif'}}</h2>
    
    <mat-dialog-content>
      <form [formGroup]="rateForm" class="rate-form">
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Prix (€)</mat-label>
          <input matInput type="number" formControlName="price" 
                 placeholder="Prix en euros" step="0.01" min="0">
          <mat-error *ngIf="rateForm.get('price')?.hasError('required')">
            Le prix est requis
          </mat-error>
          <mat-error *ngIf="rateForm.get('price')?.hasError('min')">
            Le prix doit être positif
          </mat-error>
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Date de début</mat-label>
          <input matInput [matDatepicker]="startPicker" formControlName="startDate">
          <mat-datepicker-toggle matSuffix [for]="startPicker"></mat-datepicker-toggle>
          <mat-datepicker #startPicker></mat-datepicker>
          <mat-error *ngIf="rateForm.get('startDate')?.hasError('required')">
            La date de début est requise
          </mat-error>
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Date de fin (optionnelle)</mat-label>
          <input matInput [matDatepicker]="endPicker" formControlName="endDate">
          <mat-datepicker-toggle matSuffix [for]="endPicker"></mat-datepicker-toggle>
          <mat-datepicker #endPicker></mat-datepicker>
          <mat-hint>Laissez vide si le tarif n'a pas de date de fin</mat-hint>
        </mat-form-field>
      </form>
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button mat-button (click)="onCancel()">Annuler</button>
      <button mat-raised-button color="primary" 
              (click)="onSave()" 
              [disabled]="rateForm.invalid || saving">
        <mat-icon *ngIf="saving">hourglass_empty</mat-icon>
        {{saving ? 'Sauvegarde...' : (data.rate ? 'Modifier' : 'Ajouter')}}
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .rate-form {
      display: flex;
      flex-direction: column;
      gap: 16px;
      min-width: 400px;
    }

    .full-width {
      width: 100%;
    }

    mat-dialog-content {
      max-height: 60vh;
      overflow-y: auto;
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
    // Validation personnalisée pour s'assurer que la date de fin est après la date de début
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
