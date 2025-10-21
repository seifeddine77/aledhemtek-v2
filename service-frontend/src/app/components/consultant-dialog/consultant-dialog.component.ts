import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import {MatIcon} from '@angular/material/icon';

@Component({
  selector: 'app-consultant-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule,
    MatIcon
  ],
  templateUrl: './consultant-dialog.component.html',
  styleUrls: ['./consultant-dialog.component.css']
})
export class ConsultantDialogComponent {
  consultantData = {
    companyName: '',
    jobTitle: '',
    experienceYears: ''
  };

  resumeFile: File | null = null;
  resumeFileName: string = '';

  constructor(private dialogRef: MatDialogRef<ConsultantDialogComponent>) {}

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      console.log('[DEBUG] File selected:', file);
      this.resumeFile = file;
      this.resumeFileName = file.name;
    } else {
      console.warn('[DEBUG] No file selected.');
    }
  }

  onCancel(): void {
    this.dialogRef.close(); // Close without data
  }

  onSave(): void {
    console.log('[DEBUG] Submit clicked');
    console.log('[DEBUG] Consultant Data:', this.consultantData);
    console.log('[DEBUG] Resume File:', this.resumeFile);

    if (!this.consultantData.companyName) console.error('[ERROR] Missing companyName');
    if (!this.consultantData.jobTitle) console.error('[ERROR] Missing jobTitle');
    if (!this.consultantData.experienceYears) console.error('[ERROR] Missing experienceYears');
    if (!this.resumeFile) console.error('[ERROR] Missing resume file');

    if (
      !this.consultantData.companyName ||
      !this.consultantData.jobTitle ||
      !this.consultantData.experienceYears ||
      !this.resumeFile
    ) {
      alert('Please complete all fields and upload a resume.');
      return;
    }

    const result = {
      ...this.consultantData,
      resume: this.resumeFile
    };

    console.log('[DEBUG] Consultant data submitted to parent:', result);
    this.dialogRef.close(result); // ✅ Pass the result to parent
  }
}
