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
import { cleanText } from '../../../pipes/clean-text.pipe';

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
    .dialog-modern-container {
      padding: 1.5rem;
      min-width: 540px;
      max-width: 680px;
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
      gap: 1.25rem;
      max-height: 60vh;
      overflow-y: auto;
      padding-right: 4px;
    }
    .add-material-card {
      background: #f8fafc;
      border: 1px solid var(--color-border, #e2e8f0);
      border-radius: 12px;
      padding: 1rem 1.15rem;
    }
    .add-card-title {
      display: flex;
      align-items: center;
      gap: 0.45rem;
      font-size: 0.85rem;
      font-weight: 600;
      color: var(--color-text-primary, #1e293b);
      margin-bottom: 0.85rem;
    }
    .add-card-title mat-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
      color: var(--color-primary, #2563eb);
    }
    .add-form-inline {
      display: flex;
      gap: 0.75rem;
      align-items: center;
    }
    .material-name-field {
      flex: 1;
    }
    .material-qty-field {
      width: 100px;
    }
    .btn-add-material {
      height: 56px;
      white-space: nowrap;
      border-radius: 8px;
      font-weight: 600;
    }
    .materials-count {
      font-size: 0.85rem;
      font-weight: 600;
      color: var(--color-text-secondary, #475569);
      margin-bottom: 0.5rem;
    }
    .table-scroll-wrap {
      border: 1px solid var(--color-border, #e2e8f0);
      border-radius: 10px;
      overflow: hidden;
      max-height: 240px;
      overflow-y: auto;
      background: white;
    }
    .materials-modern-table {
      width: 100%;
    }
    .materials-modern-table th {
      background: #f8fafc;
      color: var(--color-text-secondary, #475569);
      font-size: 0.8rem;
      font-weight: 600;
      padding: 0.6rem 0.85rem;
      border-bottom: 1px solid #e2e8f0;
    }
    .materials-modern-table td {
      padding: 0.35rem 0.85rem;
      border-bottom: 1px solid var(--color-border-subtle, #f1f5f9);
    }
    .cell-field {
      width: 100%;
      margin: 0;
    }
    .cell-field-qty {
      width: 80px;
      margin: 0;
    }
    .th-qty, .td-qty {
      width: 95px;
      text-align: center;
    }
    .th-actions, .td-actions {
      width: 100px;
      text-align: right;
      white-space: nowrap;
    }
    .empty-materials-notice {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.4rem;
      padding: 2rem;
      text-align: center;
      background: #f8fafc;
      border: 1px dashed var(--color-border, #cbd5e1);
      border-radius: 10px;
      color: var(--color-text-secondary, #64748b);
    }
    .empty-materials-notice mat-icon {
      font-size: 32px;
      width: 32px;
      height: 32px;
      color: var(--color-text-muted, #94a3b8);
    }
    .empty-materials-notice p {
      margin: 0;
      font-weight: 500;
      font-size: 0.9rem;
    }
    .empty-materials-notice .hint {
      font-size: 0.8rem;
      color: var(--color-text-muted, #94a3b8);
    }
    .dialog-modern-actions {
      display: flex;
      justify-content: flex-end;
      margin-top: 1.5rem;
      padding-top: 1.15rem;
      border-top: 1px solid var(--color-border, #e2e8f0);
    }
    .btn-primary {
      border-radius: 8px;
      font-weight: 600;
      box-shadow: 0 2px 4px rgba(37, 99, 235, 0.2);
      padding: 0 1.5rem;
      height: 40px;
    }
    @media (max-width: 600px) {
      .dialog-modern-container {
        min-width: 100%;
        padding: 1rem;
      }
      .add-form-inline {
        flex-direction: column;
      }
      .material-qty-field {
        width: 100%;
      }
      .btn-add-material {
        width: 100%;
        height: 44px;
      }
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
    this.dataSource.data = (data.materials || []).map((m: any) => ({
      ...m,
      name: cleanText(m.name || '')
    }));
  }

  ngOnInit(): void {}

  addMaterial(): void {
    if (this.newMaterial.name && this.newMaterial.quantity > 0) {
      const sanitizedName = cleanText(this.newMaterial.name);
      this.adminService.addMaterialToTask(this.taskId, { ...this.newMaterial, name: sanitizedName }).subscribe((material: Material) => {
        const cleaned = { ...material, name: cleanText(material.name || '') };
        this.dataSource.data = [...this.dataSource.data, cleaned];
        this.newMaterial = { name: '', quantity: 1 };
        this.snackBar.open('Matériau ajouté avec succès', 'Fermer', { duration: 3000 });
      });
    }
  }

  updateMaterial(material: Material): void {
    material.name = cleanText(material.name || '');
    this.adminService.updateMaterial(material.id, material).subscribe((updatedMaterial: Material) => {
      const index = this.dataSource.data.findIndex(m => m.id === updatedMaterial.id);
      if (index > -1) {
        const data = [...this.dataSource.data];
        data[index] = { ...updatedMaterial, name: cleanText(updatedMaterial.name || '') };
        this.dataSource.data = data;
      }
      this.snackBar.open('Matériau modifié avec succès', 'Fermer', { duration: 3000 });
    });
  }

  deleteMaterial(materialId: number): void {
    this.adminService.deleteMaterial(materialId).subscribe(() => {
      this.dataSource.data = this.dataSource.data.filter(m => m.id !== materialId);
      this.snackBar.open('Matériau supprimé avec succès', 'Fermer', { duration: 3000 });
    });
  }

  onNoClick(): void {
    this.dialogRef.close();
  }
}
