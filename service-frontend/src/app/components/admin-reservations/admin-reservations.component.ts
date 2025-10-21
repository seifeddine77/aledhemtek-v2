import { animate, state, style, transition, trigger } from '@angular/animations';
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { MatSnackBar } from '@angular/material/snack-bar';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDialog } from '@angular/material/dialog';
import { ReservationService } from '../../services/reservation.service';
import { ConsultantService } from '../../services/consultant.service';
import { AdminService } from '../../services/admin.service';
import { ReservationTasksDialogComponent } from '../dialogs/reservation-tasks-dialog/reservation-tasks-dialog.component';
import { ReservationTaskEditorComponent } from '../dialogs/reservation-task-editor/reservation-task-editor.component';
import { LocationDialogComponent } from '../dialogs/location-dialog/location-dialog.component';
import { Reservation, ReservationStatus } from '../../models/reservation.model';
import { ConsultantInterface } from '../../models/consultant-interface';

@Component({
  selector: 'app-admin-reservations',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatTableModule,
    MatSelectModule,
    MatFormFieldModule,
    MatInputModule,
    MatChipsModule,
    MatIconModule,
    MatSnackBarModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatDialogModule
  ],
  templateUrl: './admin-reservations.component.html',
  styleUrls: ['./admin-reservations.component.css'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({height: '0px', minHeight: '0'})),
      state('expanded', style({height: '*'})),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ],
})
export class AdminReservationsComponent implements OnInit {
  reservations: Reservation[] = [];
  unassignedReservations: Reservation[] = [];
  consultants: ConsultantInterface[] = [];
  selectedReservation: Reservation | null = null;
  loading = false;
  expandedElement: Reservation | null | undefined;

  displayedColumns: string[] = ['expand', 'id', 'title', 'client', 'consultant', 'startDate', 'endDate', 'location', 'status', 'actions'];
  ReservationStatus = ReservationStatus;

  constructor(
    private reservationService: ReservationService,
    private consultantService: ConsultantService,
    private adminService: AdminService,
    private snackBar: MatSnackBar,
    public dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadReservations();
    this.loadUnassignedReservations();
    this.loadConsultants();
  }

  loadReservations(): void {
    this.loading = true;
    this.reservationService.getAllReservations().subscribe({
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

  loadUnassignedReservations(): void {
    this.reservationService.getUnassignedReservations().subscribe({
      next: (reservations) => {
        this.unassignedReservations = reservations;
      },
      error: (error) => {
        console.error('Error loading unassigned reservations:', error);
      }
    });
  }

  loadConsultants(): void {
    this.consultantService.getAll().subscribe(
      (consultants: ConsultantInterface[]) => {
        this.consultants = consultants.filter((c: ConsultantInterface) => c.status === 'APPROVED');
      },
      (error: any) => {
        console.error('Error loading consultants:', error);
      }
    );
  }

  assignConsultant(reservationId: number, consultantId: number): void {
    this.reservationService.assignConsultantToReservation(reservationId, consultantId).subscribe({
      next: () => {
        this.snackBar.open('Consultant assigné avec succès', 'Fermer', { duration: 3000 });
        this.loadReservations();
        this.loadUnassignedReservations();
      },
      error: (error) => {
        console.error('Error assigning consultant:', error);
        this.snackBar.open('Erreur lors de l\'assignation du consultant', 'Fermer', { duration: 3000 });
      }
    });
  }

  updateReservationStatus(reservationId: number, status: ReservationStatus): void {
    this.reservationService.updateReservationStatus(reservationId, status).subscribe({
      next: () => {
        this.snackBar.open('Statut mis à jour avec succès', 'Fermer', { duration: 3000 });
        this.loadReservations();
      },
      error: (error) => {
        console.error('Error updating status:', error);
        this.snackBar.open('Erreur lors de la mise à jour du statut', 'Fermer', { duration: 3000 });
      }
    });
  }

  deleteReservation(reservationId: number): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette réservation ?')) {
      this.reservationService.deleteReservation(reservationId).subscribe({
        next: () => {
          this.snackBar.open('Réservation supprimée avec succès', 'Fermer', { duration: 3000 });
          this.loadReservations();
        },
        error: (error) => {
          console.error('Error deleting reservation:', error);
          this.snackBar.open('Erreur lors de la suppression', 'Fermer', { duration: 3000 });
        }
      });
    }
  }

  openTasksDialog(reservation: Reservation): void {
    // Utiliser le dialog de lecture seule pour afficher les tâches
    const dialogRef = this.dialog.open(ReservationTasksDialogComponent, {
      width: '900px',
      maxWidth: '95vw',
      data: {
        reservation: reservation
      },
      disableClose: false
    });

    dialogRef.afterClosed().subscribe(() => {
      // Optionnel: rafraîchir les données si nécessaire
    });
  }

  openTasksEditorDialog(reservation: Reservation): void {
    // Utiliser le nouveau dialog d'édition pour modifier les tâches
    const dialogRef = this.dialog.open(ReservationTaskEditorComponent, {
      width: '1200px',
      maxWidth: '95vw',
      data: {
        reservation: reservation
      },
      disableClose: false
    });

    dialogRef.afterClosed().subscribe((updatedReservation) => {
      if (updatedReservation) {
        // Rafraîchir les données
        this.loadReservations();
      }
    });
  }

  updateReservation(reservation: Reservation): void {
    this.reservationService.updateReservation(reservation.id!, reservation).subscribe({
      next: (updatedReservation) => {
        const index = this.reservations.findIndex(r => r.id === updatedReservation.id);
        if (index !== -1) {
          this.reservations[index] = updatedReservation;
          this.reservations = [...this.reservations]; // Trigger change detection
        }
        this.snackBar.open('Tâches mises à jour avec succès', 'Fermer', { duration: 3000 });
      },
      error: (err) => {
        console.error('Failed to update reservation tasks', err);
        this.snackBar.open('Erreur lors de la mise à jour des tâches', 'Fermer', { duration: 3000 });
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

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getAvailableConsultants(reservation: Reservation): ConsultantInterface[] {
    // In a real application, you would check consultant availability
    // For now, return all approved consultants
    return this.consultants;
  }

  filterReservationsByStatus(status: ReservationStatus): Reservation[] {
    return this.reservations.filter(r => r.status === status);
  }

  getStatusCount(status: ReservationStatus): number {
    return this.reservations.filter(r => r.status === status).length;
  }

  hasLocation(reservation: Reservation): boolean {
    return !!(reservation.latitude && reservation.longitude);
  }

  viewLocation(reservation: Reservation): void {
    if (this.hasLocation(reservation)) {
      this.dialog.open(LocationDialogComponent, {
        width: '600px',
        maxWidth: '90vw',
        data: { reservation }
      });
    }
  }
}
