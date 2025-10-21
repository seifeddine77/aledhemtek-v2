import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AdminService } from '../../services/admin.service';

@Component({
  selector: 'app-manage-tasks',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
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