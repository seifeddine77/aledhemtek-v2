import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Task } from '../../../models/task.model';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';

@Component({
  selector: 'app-manage-tasks-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatTableModule,
    MatIconModule,
    MatDividerModule
  ],
  templateUrl: './manage-tasks-dialog.component.html',
  styleUrls: ['./manage-tasks-dialog.component.css']
})
export class ManageTasksDialogComponent {
  tasks: Task[];
  taskForm: FormGroup;
  isEditing = false;
  editingIndex: number | null = null;

  constructor(
    public dialogRef: MatDialogRef<ManageTasksDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { tasks: Task[] },
    private fb: FormBuilder
  ) {
    this.tasks = [...data.tasks]; // Create a mutable copy
    this.taskForm = this.fb.group({
      name: ['', Validators.required],
      description: [''],
      duration: [30, [Validators.required, Validators.min(1)]]
    });
  }

  addTask(): void {
    if (this.taskForm.invalid) {
      return;
    }

    if (this.isEditing && this.editingIndex !== null) {
      // Update existing task
      this.tasks[this.editingIndex] = { ...this.tasks[this.editingIndex], ...this.taskForm.value };
    } else {
      // Add new task
      const newTask: Task = {
        ...this.taskForm.value,
        serviceId: 0 // Placeholder, adjust if needed
      };
      this.tasks.push(newTask);
    }

    this.resetForm();
  }

  editTask(index: number): void {
    this.isEditing = true;
    this.editingIndex = index;
    const taskToEdit = this.tasks[index];
    this.taskForm.patchValue(taskToEdit);
  }

  deleteTask(index: number): void {
    this.tasks.splice(index, 1);
    if (this.editingIndex === index) {
      this.resetForm();
    }
  }

  resetForm(): void {
    this.taskForm.reset({ duration: 30 });
    this.isEditing = false;
    this.editingIndex = null;
  }

  onSave(): void {
    this.dialogRef.close(this.tasks);
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
