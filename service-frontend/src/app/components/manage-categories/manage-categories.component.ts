import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AdminService } from '../../services/admin.service';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-manage-categories',
  standalone: true,
  imports: [
    CommonModule, 
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule
  ],
  templateUrl: './manage-categories.component.html',
  styleUrls: ['./manage-categories.component.css']
})
export class ManageCategoriesComponent implements OnInit {

  categoryForm: FormGroup;
  selectedFile: File | null = null;
  imagePreview: string | null = null;
  categories: any[] = [];

  constructor(private fb: FormBuilder, private adminService: AdminService) {
    this.categoryForm = this.fb.group({
      name: ['', Validators.required],
      description: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.getAllCategories();
  }

  onFileSelected(event: any): void {
    if (event.target.files.length > 0) {
      this.selectedFile = event.target.files[0];
      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreview = reader.result as string;
      };
      reader.readAsDataURL(this.selectedFile!);
    }
  }

  postCategory(): void {
    if (this.categoryForm.valid && this.selectedFile) {
      const { name, description } = this.categoryForm.value;
      this.adminService.createCategory(name, description, this.selectedFile).subscribe({
        next: (res: any) => {
          console.log('Category created successfully!', res);
          this.getAllCategories(); // Refresh the list
          this.categoryForm.reset();
          this.selectedFile = null;
          this.imagePreview = null;
          // Clear the file input visually
          const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
          if (fileInput) {
            fileInput.value = '';
          }
        },
        error: (err: any) => {
          console.error('Error creating category:', err);
        }
      });
    }
  }

  getAllCategories(): void {
    this.adminService.getAllCategories().subscribe({
      next: (res: any) => {
        this.categories = res;
      },
      error: (err: any) => {
        console.error('Error fetching categories:', err);
      }
    });
  }
}
