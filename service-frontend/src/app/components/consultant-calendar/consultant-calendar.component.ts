import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ReservationService } from '../../services/reservation.service';
import { AuthService } from '../../services/auth.service';
import { Reservation, ReservationStatus } from '../../models/reservation.model';
import { ReservationDetailsDialogComponent } from '../dialogs/reservation-details-dialog/reservation-details-dialog.component';

@Component({
  selector: 'app-consultant-calendar',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSelectModule,
    MatFormFieldModule,
    MatChipsModule,
    MatDialogModule
  ],
  templateUrl: './consultant-calendar.component.html',
  styleUrls: ['./consultant-calendar.component.css']
})
export class ConsultantCalendarComponent implements OnInit {
  reservations: Reservation[] = [];
  selectedDate: Date = new Date();
  currentWeek: Date[] = [];
  consultantId: number = 0;
  loading = false;
  
  ReservationStatus = ReservationStatus;

  constructor(
    private reservationService: ReservationService,
    private authService: AuthService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.consultantId = this.authService.getCurrentUserId();
    this.generateCurrentWeek();
    this.loadReservations();
  }

  generateCurrentWeek(): void {
    const startOfWeek = new Date(this.selectedDate);
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
    startOfWeek.setDate(diff);

    this.currentWeek = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      this.currentWeek.push(date);
    }
  }

  loadReservations(): void {
    this.loading = true;
    const startDate = new Date(this.currentWeek[0]);
    const endDate = new Date(this.currentWeek[6]);
    endDate.setHours(23, 59, 59, 999);

    this.reservationService.getConsultantCalendar(
      this.consultantId,
      startDate.toISOString(),
      endDate.toISOString()
    ).subscribe({
      next: (reservations) => {
        this.reservations = reservations;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading reservations:', error);
        this.loading = false;
      }
    });
  }

  getReservationsForDate(date: Date): Reservation[] {
    return this.reservations.filter(reservation => {
      const reservationDate = new Date(reservation.startDate);
      return reservationDate.toDateString() === date.toDateString();
    });
  }

  previousWeek(): void {
    this.selectedDate.setDate(this.selectedDate.getDate() - 7);
    this.generateCurrentWeek();
    this.loadReservations();
  }

  nextWeek(): void {
    this.selectedDate.setDate(this.selectedDate.getDate() + 7);
    this.generateCurrentWeek();
    this.loadReservations();
  }

  updateReservationStatus(reservationId: number, status: ReservationStatus): void {
    this.reservationService.updateReservationStatus(reservationId, status).subscribe({
      next: () => {
        this.loadReservations();
      },
      error: (error) => {
        console.error('Error updating reservation status:', error);
      }
    });
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

  formatTime(dateString: string): string {
    return new Date(dateString).toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getDayName(date: Date): string {
    return date.toLocaleDateString('fr-FR', { weekday: 'long' });
  }

  getDayNumber(date: Date): string {
    return date.getDate().toString();
  }

  isToday(date: Date): boolean {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  }

  /**
   * Vérifier si une réservation a des données de localisation
   */
  hasLocation(reservation: Reservation): boolean {
    return !!(reservation.latitude && reservation.longitude);
  }

  /**
   * Afficher les détails d'une réservation dans un dialog
   */
  viewReservationDetails(reservation: Reservation): void {
    const dialogRef = this.dialog.open(ReservationDetailsDialogComponent, {
      width: '90vw',
      maxWidth: '800px',
      maxHeight: '90vh',
      data: {
        reservation: reservation
      },
      panelClass: 'reservation-details-dialog'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        console.log('Dialog fermé avec résultat:', result);
      }
    });
  }
}
