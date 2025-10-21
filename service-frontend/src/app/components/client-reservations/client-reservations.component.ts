import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ReservationService } from '../../services/reservation.service';
import { AuthService } from '../../services/auth.service';
import { EvaluationService } from '../../services/evaluation.service';
import { Reservation, ReservationStatus } from '../../models/reservation.model';
import { EvaluationFormComponent } from '../evaluation-form/evaluation-form.component';
import { ClientReservationDetailsDialogComponent } from '../dialogs/client-reservation-details-dialog/client-reservation-details-dialog.component';

@Component({
  selector: 'app-client-reservations',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatTableModule,
    MatChipsModule,
    MatIconModule,
    MatTabsModule,
    MatProgressSpinnerModule,
    MatDialogModule,
    MatSnackBarModule
  ],
  templateUrl: './client-reservations.component.html',
  styleUrls: ['./client-reservations.component.css']
})
export class ClientReservationsComponent implements OnInit {
  reservations: Reservation[] = [];
  loading = false;
  clientId: number = 0;
  
  displayedColumns: string[] = ['title', 'consultant', 'startDate', 'endDate', 'status', 'actions'];
  ReservationStatus = ReservationStatus;

  constructor(
    private reservationService: ReservationService,
    private authService: AuthService,
    private evaluationService: EvaluationService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.clientId = this.authService.getCurrentUserId();
    this.loadReservations();
  }

  loadReservations(): void {
    this.loading = true;
    this.reservationService.getReservationsByClient(this.clientId).subscribe({
      next: (reservations) => {
        this.reservations = reservations.sort((a, b) => 
          new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime()
        );
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading reservations:', error);
        this.loading = false;
      }
    });
  }

  getReservationsByStatus(status: ReservationStatus): Reservation[] {
    return this.reservations.filter(r => r.status === status);
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

  getStatusText(status: ReservationStatus): string {
    switch (status) {
      case ReservationStatus.PENDING:
        return 'En attente';
      case ReservationStatus.ASSIGNED:
        return 'Assignée';
      case ReservationStatus.IN_PROGRESS:
        return 'En cours';
      case ReservationStatus.COMPLETED:
        return 'Terminée';
      case ReservationStatus.CANCELLED:
        return 'Annulée';
      default:
        return status;
    }
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  createNewReservation(): void {
    this.router.navigate(['/client/create-reservation-with-tasks']);
  }

  viewReservationDetails(reservationId: number): void {
    const reservation = this.reservations.find(r => r.id === reservationId);
    if (reservation) {
      const dialogRef = this.dialog.open(ClientReservationDetailsDialogComponent, {
        width: '800px',
        maxWidth: '90vw',
        data: { reservation }
      });
      
      dialogRef.afterClosed().subscribe(result => {
        if (result === 'evaluate') {
          this.openEvaluationDialog(reservation);
        }
      });
    } else {
      this.snackBar.open('Réservation non trouvée', 'Fermer', { duration: 3000 });
    }
  }

  canCancelReservation(reservation: Reservation): boolean {
    return reservation.status === ReservationStatus.PENDING || 
           reservation.status === ReservationStatus.ASSIGNED;
  }

  cancelReservation(reservationId: number): void {
    if (confirm('Êtes-vous sûr de vouloir annuler cette réservation ?')) {
      this.reservationService.updateReservationStatus(reservationId, ReservationStatus.CANCELLED).subscribe({
        next: () => {
          this.loadReservations();
        },
        error: (error) => {
          console.error('Error cancelling reservation:', error);
        }
      });
    }
  }

  getStatusCount(status: ReservationStatus): number {
    return this.getReservationsByStatus(status).length;
  }

  getStatusIcon(status: ReservationStatus): string {
    switch (status) {
      case ReservationStatus.PENDING:
        return 'schedule';
      case ReservationStatus.ASSIGNED:
        return 'assignment';
      case ReservationStatus.IN_PROGRESS:
        return 'work';
      case ReservationStatus.COMPLETED:
        return 'check_circle';
      case ReservationStatus.CANCELLED:
        return 'cancel';
      default:
        return 'help';
    }
  }

  // Evaluation methods
  openEvaluationDialog(reservation: Reservation): void {
    if (reservation.status !== ReservationStatus.COMPLETED) {
      this.snackBar.open('Vous ne pouvez évaluer que les interventions terminées', 'Fermer', { duration: 3000 });
      return;
    }

    // Check if evaluation already exists
    this.evaluationService.getEvaluationByReservation(reservation.id!).subscribe({
      next: (existingEvaluation) => {
        this.openEvaluationForm(reservation, existingEvaluation);
      },
      error: () => {
        // No existing evaluation, create new one
        this.openEvaluationForm(reservation);
      }
    });
  }

  private openEvaluationForm(reservation: Reservation, existingEvaluation?: any): void {
    const dialogRef = this.dialog.open(EvaluationFormComponent, {
      width: '600px',
      data: {
        reservation: reservation,
        evaluation: existingEvaluation
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.snackBar.open('Évaluation sauvegardée avec succès', 'Fermer', { duration: 3000 });
      }
    });
  }

  canEvaluate(reservation: Reservation): boolean {
    return reservation.status === ReservationStatus.COMPLETED;
  }
}
