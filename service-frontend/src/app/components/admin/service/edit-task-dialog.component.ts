import { Component, Inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { cleanText } from '../../../pipes/clean-text.pipe';

export interface TaskData {
  id: number;
  name: string;
  description: string;
  duration: number;
  price: number;
}

@Component({
  selector: 'app-edit-task-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './edit-task-dialog.component.html',
  styles: [`
    .dialog-modern-container {
      padding: 1.5rem;
      width: 100%;
      box-sizing: border-box;
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
    .edit-task-form {
      display: flex;
      flex-direction: column;
      gap: 1.1rem;
    }
    .form-row-2 {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 0.85rem;
    }
    .field-unit {
      font-size: 0.85rem;
      font-weight: 600;
      color: var(--color-text-muted, #64748b);
      margin-right: 8px;
    }
    .dialog-modern-actions {
      display: flex;
      justify-content: flex-end;
      align-items: center;
      gap: 0.85rem;
      margin-top: 1.5rem;
      padding-top: 1.15rem;
      border-top: 1px solid var(--color-border, #e2e8f0);
      box-sizing: border-box;
      width: 100%;
    }
    .btn-cancel {
      border: 1px solid #cbd5e1;
      border-radius: 8px;
      font-weight: 500;
      color: #475569;
      padding: 0 1.25rem;
      height: 40px;
      white-space: nowrap;
      flex-shrink: 0;
    }
    .btn-primary {
      border-radius: 8px;
      font-weight: 600;
      box-shadow: 0 2px 4px rgba(37, 99, 235, 0.2);
      padding: 0 1.5rem;
      height: 40px;
      white-space: nowrap;
      flex-shrink: 0;
      display: inline-flex;
      align-items: center;
      gap: 6px;
    }
    .w-100 {
      width: 100%;
    }
    @media (max-width: 480px) {
      .dialog-modern-container {
        min-width: 100%;
        padding: 1rem;
      }
      .form-row-2 {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class EditTaskDialogComponent {

  constructor(
    public dialogRef: MatDialogRef<EditTaskDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: TaskData
  ) {
    if (this.data) {
      this.data.name = cleanText(this.data.name || '');
      this.data.description = cleanText(this.data.description || '');
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onSave(): void {
    this.dialogRef.close(this.data);
  }
}
