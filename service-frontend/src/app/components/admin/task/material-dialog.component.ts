import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';

export interface MaterialData {
  name: string;
  quantity: number;
}

@Component({
  selector: 'app-material-dialog',
  template: `
    <h1 mat-dialog-title>Ajouter un matériau</h1>
    <div mat-dialog-content>
      <mat-form-field appearance="outline" class="full-width">
        <mat-label>Nom du matériau</mat-label>
        <input matInput [(ngModel)]="data.name" name="name" required>
      </mat-form-field>
      <mat-form-field appearance="outline" class="full-width">
        <mat-label>Quantité</mat-label>
        <input matInput type="number" [(ngModel)]="data.quantity" name="quantity" required min="1">
      </mat-form-field>
    </div>
    <div mat-dialog-actions align="end">
      <button mat-button (click)="onNoClick()">Annuler</button>
      <button mat-raised-button color="primary" [mat-dialog-close]="data" [disabled]="!data.name || !data.quantity || data.quantity <= 0">Ajouter</button>
    </div>
  `,
  styles: [`
    .full-width { 
      width: 100%; 
    }
    div[mat-dialog-content] {
      display: flex;
      flex-direction: column;
      padding-top: 1rem;
      gap: 0.5rem;
    }
  `],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatDialogModule
  ]
})
export class MaterialDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<MaterialDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: MaterialData
  ) {}

  onNoClick(): void {
    this.dialogRef.close();
  }
}
