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
import { ReservationDetailsDialogComponent } from '../dialogs/reservation-details-dialog/reservation-details-dialog.component';
import { LocationDialogComponent } from '../dialogs/location-dialog/location-dialog.component';
import { Reservation, ReservationStatus } from '../../models/reservation.model';
import { ConsultantInterface } from '../../models/consultant-interface';
import { PaginationComponent, PaginationConfig } from '../shared/pagination/pagination.component';
import { CleanTextPipe } from '../../pipes/clean-text.pipe';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';

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
    MatDialogModule,
    MatMenuModule,
    MatTooltipModule,
    PaginationComponent,
    CleanTextPipe
  ],
  templateUrl: './admin-reservations.component.html',
  styleUrls: ['./admin-reservations.component.css']
})
export class AdminReservationsComponent implements OnInit {
  reservations: Reservation[] = [];
  filteredReservations: Reservation[] = [];
  paginatedReservations: Reservation[] = [];
  unassignedReservations: Reservation[] = [];
  consultants: ConsultantInterface[] = [];
  selectedReservation: Reservation | null = null;
  loading = false;
  selectedTab: string = 'ALL';
  searchTerm: string = '';

  paginationConfig: PaginationConfig = {
    currentPage: 1,
    totalItems: 0,
    itemsPerPage: 10,
    pageSizeOptions: [5, 10, 25, 50]
  };

  displayedColumns: string[] = ['id', 'title', 'client', 'consultant', 'dates', 'location', 'status', 'actions'];
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

  selectTab(tab: string): void {
    this.selectedTab = tab;
    this.applyFilter();
  }

  onSearchChange(): void {
    this.applyFilter();
  }

  applyFilter(): void {
    let result = [...this.reservations];

    if (this.selectedTab === 'UNASSIGNED') {
      result = result.filter(r => !r.consultantId);
    } else if (this.selectedTab !== 'ALL') {
      result = result.filter(r => r.status === this.selectedTab);
    }

    if (this.searchTerm && this.searchTerm.trim()) {
      const q = this.searchTerm.toLowerCase().trim();
      result = result.filter(r => 
        (r.title && r.title.toLowerCase().includes(q)) ||
        (r.clientName && r.clientName.toLowerCase().includes(q)) ||
        (r.consultantName && r.consultantName.toLowerCase().includes(q)) ||
        (r.id && r.id.toString().includes(q))
      );
    }

    this.filteredReservations = result;
    this.paginationConfig.totalItems = result.length;
    this.paginationConfig.currentPage = 1;
    this.updatePaginatedReservations();
  }

  getTabCount(tab: string): number {
    if (tab === 'ALL') return this.reservations.length;
    if (tab === 'UNASSIGNED') return this.reservations.filter(r => !r.consultantId).length;
    return this.reservations.filter(r => r.status === tab).length;
  }

  updatePagination(): void {
    this.applyFilter();
  }

  updatePaginatedReservations(): void {
    const startIndex = (this.paginationConfig.currentPage - 1) * this.paginationConfig.itemsPerPage;
    const endIndex = startIndex + this.paginationConfig.itemsPerPage;
    this.paginatedReservations = this.filteredReservations.slice(startIndex, endIndex);
  }

  onPageChange(page: number): void {
    this.paginationConfig.currentPage = page;
    this.updatePaginatedReservations();
  }

  onPageSizeChange(pageSize: number): void {
    this.paginationConfig.itemsPerPage = pageSize;
    this.paginationConfig.currentPage = 1;
    this.updatePagination();
  }

  loadReservations(): void {
    this.loading = true;
    this.reservationService.getAllReservations().subscribe({
      next: (reservations) => {
        this.reservations = reservations;
        this.updatePagination();
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
      width: '980px',
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

  openReservationDetailsDialog(reservation: Reservation): void {
    this.dialog.open(ReservationDetailsDialogComponent, {
      width: '920px',
      maxWidth: '95vw',
      data: {
        reservation: reservation
      },
      disableClose: false
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
