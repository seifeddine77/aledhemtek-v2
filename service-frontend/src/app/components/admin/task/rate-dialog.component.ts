import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';

export interface RateData {
  price: number | null;
  startDate: Date | null;
  endDate: Date | null;
}

@Component({
  selector: 'app-rate-dialog',
  standalone: true,
  templateUrl: './rate-dialog.component.html',
  styles: [`
    .dialog-content {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      padding-top: 1rem;
    }
    .full-width {
      width: 100%;
    }
  `],
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatDialogModule
  ]
})
export class RateDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<RateDialogComponent, RateData>,
    @Inject(MAT_DIALOG_DATA) public data: RateData
  ) {}
}
