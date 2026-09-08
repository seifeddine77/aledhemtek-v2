import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AdminService } from '../../../services/admin.service';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-add-task-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './add-task-dialog.component.html',
  styles: [`
    .dialog-modern-container {
      padding: 1.5rem;
      min-width: 420px;
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
    .task-dialog-form {
      display: flex;
      flex-direction: column;
      gap: 1rem;
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
    }
  `]
})
export class AddTaskDialogComponent implements OnInit {
  taskForm: FormGroup;
  services: any[] = [];

  constructor(
    public dialogRef: MatDialogRef<AddTaskDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private fb: FormBuilder,
    private adminService: AdminService
  ) {
    this.taskForm = this.fb.group({
      name: ['', Validators.required],
      description: ['', Validators.required],
      serviceId: ['', Validators.required]
    });
    this.services = data.services;
  }

  ngOnInit(): void {}

  onNoClick(): void {
    this.dialogRef.close();
  }

  createTask(): void {
    if (this.taskForm.valid) {
      const taskData = this.taskForm.value;
      this.adminService.createTask(taskData, taskData.serviceId).subscribe(() => {
        this.dialogRef.close(true);
      });
    }
  }
}
