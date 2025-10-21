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
})
export class AddServiceDialogComponent implements OnInit {
  serviceForm: FormGroup;
  categories: any[] = [];
  selectedFile: File | null = null;

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
  }

  openAddCategoryDialog(): void {
    const dialogRef = this.dialog.open(AddCategoryDialogComponent, {
      width: '400px',
      data: { name: '', description: '', file: null }
    });

    dialogRef.afterClosed().subscribe((result: AddCategoryData | undefined) => {
      if (result && result.name && result.file) {
        const categoryDto = { name: result.name, description: result.description };
        this.adminService.createCategory(categoryDto, result.file).subscribe(() => {
          this.loadCategories(); // Refresh categories list
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
