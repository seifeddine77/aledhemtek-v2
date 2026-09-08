import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MaterialDto } from '../../../services/task.service';
import { cleanText } from '../../../pipes/clean-text.pipe';

@Component({
  selector: 'app-material-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule
  ],
  template: `
    <div class="dialog-modern-container">
      <div class="dialog-modern-header">
        <div class="dialog-header-badge">
          <mat-icon>handyman</mat-icon>
        </div>
        <div class="dialog-header-text">
          <h2>{{data.material ? 'Modifier le matériau' : 'Ajouter un matériau'}}</h2>
          <p>Détaillez la désignation et la quantité requise pour l'intervention</p>
        </div>
      </div>
      
      <div class="dialog-modern-body">
        <form [formGroup]="materialForm" class="material-form">
          <mat-form-field appearance="outline" class="w-100">
            <mat-label>Désignation du matériau</mat-label>
            <mat-icon matPrefix>inventory_2</mat-icon>
            <input matInput formControlName="name" 
                   placeholder="Ex: Vis à bois, Colle PVC, Peinture satinée..." autofocus>
            <mat-error *ngIf="materialForm.get('name')?.hasError('required')">
              Le nom du matériau est obligatoire
            </mat-error>
          </mat-form-field>

          <mat-form-field appearance="outline" class="w-100">
            <mat-label>Quantité nécessaire</mat-label>
            <mat-icon matPrefix>format_list_numbered</mat-icon>
            <input matInput type="number" formControlName="quantity" 
                   placeholder="Ex: 5" min="1">
            <mat-error *ngIf="materialForm.get('quantity')?.hasError('required')">
              La quantité est obligatoire
            </mat-error>
            <mat-error *ngIf="materialForm.get('quantity')?.hasError('min')">
              La quantité minimale est de 1
            </mat-error>
          </mat-form-field>
        </form>
      </div>

      <div class="dialog-modern-actions">
        <button mat-button (click)="onCancel()" class="btn-cancel">Annuler</button>
        <button mat-raised-button color="primary" 
                (click)="onSave()" 
                [disabled]="materialForm.invalid || saving" class="btn-primary">
          <mat-icon *ngIf="saving">hourglass_empty</mat-icon>
          <mat-icon *ngIf="!saving">check</mat-icon>
          {{saving ? 'Enregistrement...' : (data.material ? 'Mettre à jour' : 'Ajouter le matériau')}}
        </button>
      </div>
    </div>
  `,
  styles: [`
    .dialog-modern-container {
      padding: 1.5rem;
      min-width: 400px;
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
    }
    .material-form {
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
  `]
})
export class MaterialDialogComponent implements OnInit {
  materialForm: FormGroup;
  saving = false;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<MaterialDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { material?: MaterialDto }
  ) {
    const rawName = data.material?.name || '';
    this.materialForm = this.fb.group({
      name: [cleanText(rawName), [Validators.required]],
      quantity: [data.material?.quantity || 1, [Validators.required, Validators.min(1)]]
    });
  }

  ngOnInit(): void {}

  onSave(): void {
    if (this.materialForm.valid) {
      this.saving = true;
      
      const materialData: MaterialDto = {
        ...this.data.material,
        ...this.materialForm.value
      };

      this.dialogRef.close(materialData);
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
