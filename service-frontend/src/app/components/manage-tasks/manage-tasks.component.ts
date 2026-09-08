import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AdminService } from '../../services/admin.service';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-manage-tasks',
  standalone: true,
  imports: [
    CommonModule, 
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule
  ],
  templateUrl: './manage-tasks.component.html',
  styleUrls: ['./manage-tasks.component.css']
})
export class ManageTasksComponent implements OnInit {

  taskForm: FormGroup;
  services: any[] = [];
  tasks: any[] = [];

  constructor(private fb: FormBuilder, private adminService: AdminService) {
    this.taskForm = this.fb.group({
      name: ['', Validators.required],
      price: [null, Validators.required],
      description: [''],
      serviceId: [null, Validators.required]
    });
  }

  ngOnInit(): void {
    this.getAllServices();
    this.getAllTasks();
  }

  postTask(): void {
    if (this.taskForm.valid) {
      this.adminService.createTask(this.taskForm.value).subscribe({
        next: (res: any) => {
          console.log('Task created successfully!', res);
          this.getAllTasks(); // Refresh the list
          this.taskForm.reset();
        },
        error: (err: any) => {
          console.error('Error creating task:', err);
        }
      });
    }
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

  getAllTasks(): void {
    this.adminService.getAllTasks().subscribe({
      next: (res: any) => {
        this.tasks = res;
      },
      error: (err: any) => {
        console.error('Error fetching tasks:', err);
      }
    });
  }
}