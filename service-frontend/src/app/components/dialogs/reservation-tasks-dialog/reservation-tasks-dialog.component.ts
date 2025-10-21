import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { Task } from '../../../models/task.model';
import { Reservation, ReservationStatus } from '../../../models/reservation.model';

@Component({
  selector: 'app-reservation-tasks-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatTableModule,
    MatIconModule,
    MatDividerModule,
    MatCardModule,
    MatChipsModule
  ],
  templateUrl: './reservation-tasks-dialog.component.html',
  styleUrls: ['./reservation-tasks-dialog.component.css']
})
export class ReservationTasksDialogComponent {
  reservation: Reservation;
  tasks: Task[];
  totalDuration: number = 0;
  totalPrice: number = 0;

  displayedColumns: string[] = ['name', 'description', 'duration', 'price'];

  constructor(
    public dialogRef: MatDialogRef<ReservationTasksDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { reservation: Reservation }
  ) {
    this.reservation = data.reservation;
    this.tasks = this.reservation.tasks || [];
    this.calculateTotals();
  }

  private calculateTotals(): void {
    this.totalDuration = this.tasks.reduce((sum, task) => sum + (task.duration || 0), 0);
    // Note: Si vous avez un prix par tâche, ajoutez-le ici
    this.totalPrice = this.reservation.totalPrice || 0;
  }

  formatDuration(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    
    if (hours > 0) {
      return `${hours}h ${mins}min`;
    }
    return `${mins}min`;
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(price);
  }

  getStatusColor(status: ReservationStatus): string {
    switch (status) {
      case ReservationStatus.PENDING:
        return '#ff9800';
      case ReservationStatus.ASSIGNED:
        return '#2196f3';
      case ReservationStatus.IN_PROGRESS:
        return '#4caf50';
      case ReservationStatus.COMPLETED:
        return '#8bc34a';
      case ReservationStatus.CANCELLED:
        return '#f44336';
      default:
        return '#9e9e9e';
    }
  }

  onClose(): void {
    this.dialogRef.close();
  }
}
