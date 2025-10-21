import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AdminService } from '../../services/admin.service';

@Component({
  selector: 'app-manage-services',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './manage-services.component.html',
  styleUrls: ['./manage-services.component.css']
})
export class ManageServicesComponent implements OnInit {

  serviceForm: FormGroup;
  selectedFile: File | null = null;
  categories: any[] = [];
  services: any[] = [];

  constructor(private fb: FormBuilder, private adminService: AdminService) {
    this.serviceForm = this.fb.group({
      name: ['', Validators.required],
      description: ['', Validators.required],
      categoryId: [null, Validators.required]
    });
  }

  ngOnInit(): void {
    this.getAllCategories();
    this.getAllServices();
  }

  onFileSelected(event: any): void {
    if (event.target.files.length > 0) {
      this.selectedFile = event.target.files[0];
    }
  }

  postService(): void {
    if (this.serviceForm.valid && this.selectedFile) {
      this.adminService.createService(this.serviceForm.value, this.selectedFile).subscribe({
        next: (res: any) => {
          console.log('Service created successfully!', res);
          this.getAllServices(); // Refresh the list
          this.serviceForm.reset();
          this.selectedFile = null;
          const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
          if (fileInput) {
            fileInput.value = '';
          }
        },
        error: (err: any) => {
          console.error('Error creating service:', err);
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

  getAllServices(): void {
    this.adminService.getAllServices().subscribe({
      next: (res: any) => {
        this.services = res;
      },
      error: (err: any) => {
        console.error('Error fetching services:', err);
      }
    });
  }
}