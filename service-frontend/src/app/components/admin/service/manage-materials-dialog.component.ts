import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { AdminService } from '../../../services/admin.service';
import { MatTableDataSource } from '@angular/material/table';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Material } from '../../../models/Material';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-manage-materials-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatTableModule,
    MatIconModule,
    MatSnackBarModule,
    MatTooltipModule
  ],
  templateUrl: './manage-materials-dialog.component.html',
  styles: [`
    .dialog-content {
      max-height: 70vh;
      overflow: hidden;
      padding-right: 4px;
      display: flex;
      flex-direction: column;
      gap: 20px;
    }
    .add-material-form {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .form-field {
      flex-grow: 1;
    }
    .quantity-field {
      width: 100px;
    }
    .material-table {
      width: 100%;
      max-height: 45vh;
      overflow: auto;
    }
    .material-table th {
      position: sticky;
      top: 0;
      z-index: 1;
      background: #fafafa;
    }
    .mat-form-field {
        width: 100%;
        margin: 0;
    }
    .mat-dialog-actions{
        justify-content: flex-end;
    }
  `]
})
export class ManageMaterialsDialogComponent implements OnInit {
  dataSource = new MatTableDataSource<Material>();
  displayedColumns: string[] = ['name', 'quantity', 'actions'];
  newMaterial = { name: '', quantity: 1 };
  taskId: number;

  constructor(
    public dialogRef: MatDialogRef<ManageMaterialsDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private adminService: AdminService,
    private snackBar: MatSnackBar
  ) {
    this.taskId = data.taskId;
    this.dataSource.data = data.materials || [];
  }

  ngOnInit(): void {}

  addMaterial(): void {
    if (this.newMaterial.name && this.newMaterial.quantity > 0) {
      this.adminService.addMaterialToTask(this.taskId, this.newMaterial).subscribe((material: Material) => {
        this.dataSource.data = [...this.dataSource.data, material];
        this.newMaterial = { name: '', quantity: 1 };
        this.snackBar.open('Matériau ajouté', 'Fermer', { duration: 3000 });
      });
    }
  }

  updateMaterial(material: Material): void {
    this.adminService.updateMaterial(material.id, material).subscribe((updatedMaterial: Material) => {
      const index = this.dataSource.data.findIndex(m => m.id === updatedMaterial.id);
      if (index > -1) {
        const data = this.dataSource.data;
        data[index] = updatedMaterial;
        this.dataSource.data = data;
      }
      this.snackBar.open('Matériau modifié', 'Fermer', { duration: 3000 });
    });
  }

  deleteMaterial(materialId: number): void {
    this.adminService.deleteMaterial(materialId).subscribe(() => {
      this.dataSource.data = this.dataSource.data.filter(m => m.id !== materialId);
      this.snackBar.open('Matériau supprimé', 'Fermer', { duration: 3000 });
    });
  }

  onNoClick(): void {
    this.dialogRef.close();
  }
}
