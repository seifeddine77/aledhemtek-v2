import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MaterialDto } from '../../../services/task.service';

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
    <h2 mat-dialog-title>{{data.material ? 'Modifier le matériau' : 'Ajouter un matériau'}}</h2>
    
    <mat-dialog-content>
      <form [formGroup]="materialForm" class="material-form">
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Nom du matériau</mat-label>
          <input matInput formControlName="name" 
                 placeholder="Ex: Vis, Clous, Peinture...">
          <mat-error *ngIf="materialForm.get('name')?.hasError('required')">
            Le nom est requis
          </mat-error>
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Quantité</mat-label>
          <input matInput type="number" formControlName="quantity" 
                 placeholder="Quantité nécessaire" min="1">
          <mat-error *ngIf="materialForm.get('quantity')?.hasError('required')">
            La quantité est requise
          </mat-error>
          <mat-error *ngIf="materialForm.get('quantity')?.hasError('min')">
            La quantité doit être au moins 1
          </mat-error>
        </mat-form-field>
      </form>
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button mat-button (click)="onCancel()">Annuler</button>
      <button mat-raised-button color="primary" 
              (click)="onSave()" 
              [disabled]="materialForm.invalid || saving">
        <mat-icon *ngIf="saving">hourglass_empty</mat-icon>
        {{saving ? 'Sauvegarde...' : (data.material ? 'Modifier' : 'Ajouter')}}
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .material-form {
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
export class MaterialDialogComponent implements OnInit {
  materialForm: FormGroup;
  saving = false;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<MaterialDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { material?: MaterialDto }
  ) {
    this.materialForm = this.fb.group({
      name: [data.material?.name || '', [Validators.required]],
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
