import { Component, OnInit, Inject } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AdminService } from '../../../services/admin.service';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AddCategoryDialogComponent, AddCategoryData } from '../service/add-category-dialog.component';

@Component({
  selector: 'app-add-service-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule
  ],
  templateUrl: './add-service-dialog.component.html',
  styles: [`
    .dialog-modern-container {
      padding: 1.5rem;
      min-width: 440px;
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
    .service-dialog-form {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }
    .category-select-row {
      display: flex;
      gap: 0.75rem;
      align-items: flex-start;
    }
    .flex-grow {
      flex: 1;
    }
    .btn-new-cat {
      height: 56px;
      white-space: nowrap;
    }
    .upload-box-modern {
      border: 2px dashed var(--color-border, #cbd5e1);
      border-radius: 10px;
      padding: 1.25rem;
      text-align: center;
      background: #f8fafc;
      cursor: pointer;
      transition: all 0.2s ease;
    }
    .upload-box-modern:hover {
      border-color: var(--color-primary, #2563eb);
      background: rgba(37, 99, 235, 0.02);
    }
    .upload-state-empty {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.35rem;
    }
    .upload-icon {
      font-size: 32px;
      width: 32px;
      height: 32px;
      color: var(--color-primary, #2563eb);
    }
    .upload-text {
      font-size: 0.9rem;
      font-weight: 600;
      color: var(--color-text-primary, #1e293b);
    }
    .upload-subtext {
      font-size: 0.75rem;
      color: var(--color-text-muted, #94a3b8);
    }
    .upload-state-preview img {
      max-height: 120px;
      border-radius: 8px;
      object-fit: cover;
    }
    .preview-actions {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-top: 0.5rem;
      font-size: 0.8rem;
    }
    .file-name {
      color: var(--color-text-secondary, #475569);
      max-width: 200px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .btn-change {
      display: inline-flex;
      align-items: center;
      gap: 0.25rem;
      border: none;
      background: none;
      color: var(--color-primary, #2563eb);
      font-weight: 600;
      cursor: pointer;
    }
    .dialog-modern-actions {
      display: flex;
      justify-content: flex-end;
      gap: 0.75rem;
      margin-top: 1.5rem;
      padding-top: 1rem;
      border-top: 1px solid var(--color-border, #e2e8f0);
    }
    .w-100 {
      width: 100%;
    }
    @media (max-width: 480px) {
      .dialog-modern-container {
        min-width: 100%;
        padding: 1rem;
      }
      .category-select-row {
        flex-direction: column;
      }
      .btn-new-cat {
        width: 100%;
        height: 44px;
      }
    }
  `]
})
export class AddServiceDialogComponent implements OnInit {
  serviceForm: FormGroup;
  categories: any[] = [];
  selectedFile: File | null = null;
  imagePreview: string | null = null;

  constructor(
    public dialogRef: MatDialogRef<AddServiceDialogComponent>,
    public dialog: MatDialog,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private fb: FormBuilder,
    private adminService: AdminService
  ) {
    this.serviceForm = this.fb.group({
      name: ['', Validators.required],
      description: ['', Validators.required],
      categoryId: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadCategories();
  }

  loadCategories(): void {
    this.adminService.getAllCategories().subscribe(categories => {
      this.categories = categories;
    });
  }

  onFileSelected(event: any): void {
    this.selectedFile = event.target.files[0];
    if (this.selectedFile) {
      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreview = reader.result as string;
      };
      reader.readAsDataURL(this.selectedFile);
    }
  }

  openAddCategoryDialog(): void {
    const dialogRef = this.dialog.open(AddCategoryDialogComponent, {
      width: '440px',
      data: { name: '', description: '', file: null }
    });

    dialogRef.afterClosed().subscribe((result: AddCategoryData | undefined) => {
      if (result && result.name && result.file) {
        const categoryDto = { name: result.name, description: result.description };
        this.adminService.createCategory(categoryDto, result.file).subscribe(() => {
          this.loadCategories();
        });
      }
    });
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  createService(): void {
    if (this.serviceForm.valid && this.selectedFile) {
      this.adminService.createService(this.serviceForm.value, this.selectedFile).subscribe(() => {
        this.dialogRef.close(true);
      });
    }
  }
}
