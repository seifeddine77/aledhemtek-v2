import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AdminService } from '../../services/admin.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-manage-categories',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './manage-categories.component.html',
  styleUrls: ['./manage-categories.component.css']
})
export class ManageCategoriesComponent implements OnInit {

  categoryForm: FormGroup;
  selectedFile: File | null = null;
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
