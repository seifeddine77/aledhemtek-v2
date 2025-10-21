import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { EvaluationService } from '../../services/evaluation.service';
import { AuthService } from '../../services/auth.service';
import { ReservationService } from '../../services/reservation.service';
import { Evaluation } from '../../models/evaluation.model';
import { Reservation } from '../../models/reservation.model';
import { EvaluationFormComponent } from '../evaluation-form/evaluation-form.component';

@Component({
  selector: 'app-client-evaluations',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatDialogModule,
    MatDividerModule,
    MatTooltipModule
  ],
  templateUrl: './client-evaluations.component.html',
  styleUrls: ['./client-evaluations.component.css']
})
export class ClientEvaluationsComponent implements OnInit {
  evaluations: Evaluation[] = [];
  reservations: Map<number, Reservation> = new Map();
  loading = true;
  currentUserId: number | null = null;

  constructor(
    private evaluationService: EvaluationService,
    private authService: AuthService,
    private reservationService: ReservationService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.currentUserId = this.authService.getCurrentUserId();
    if (this.currentUserId) {
      this.loadClientEvaluations();
    }
  }

  loadClientEvaluations(): void {
    if (!this.currentUserId) return;

    this.loading = true;
    this.evaluationService.getClientEvaluations(this.currentUserId).subscribe({
      next: (evaluations) => {
        this.evaluations = evaluations;
        this.loadReservationDetails();
      },
      error: (error) => {
        console.error('Erreur lors du chargement des évaluations:', error);
        this.snackBar.open('Erreur lors du chargement des évaluations', 'Fermer', { duration: 3000 });
        this.loading = false;
      }
    });
  }

  private loadReservationDetails(): void {
    const reservationIds = [...new Set(this.evaluations.map(e => e.reservationId))];
    let loadedCount = 0;

    if (reservationIds.length === 0) {
      this.loading = false;
      return;
    }

    reservationIds.forEach(id => {
      this.reservationService.getReservationById(id).subscribe({
        next: (reservation) => {
          this.reservations.set(id, reservation);
          loadedCount++;
          if (loadedCount === reservationIds.length) {
            this.loading = false;
          }
        },
        error: (error) => {
          console.error(`Erreur lors du chargement de la réservation ${id}:`, error);
          loadedCount++;
          if (loadedCount === reservationIds.length) {
            this.loading = false;
          }
        }
      });
    });
  }

  getReservation(reservationId: number): Reservation | undefined {
    return this.reservations.get(reservationId);
  }

  getStarArray(rating: number): number[] {
    return Array(5).fill(0).map((_, i) => i + 1);
  }

  editEvaluation(evaluation: Evaluation): void {
    const reservation = this.getReservation(evaluation.reservationId);
    if (!reservation) {
      this.snackBar.open('Réservation non trouvée', 'Fermer', { duration: 3000 });
      return;
    }

    const dialogRef = this.dialog.open(EvaluationFormComponent, {
      width: '600px',
      data: { 
        reservation: reservation,
        evaluation: evaluation
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadClientEvaluations(); // Recharger les évaluations
        this.snackBar.open('Évaluation mise à jour avec succès', 'Fermer', { duration: 3000 });
      }
    });
  }

  deleteEvaluation(evaluation: Evaluation): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette évaluation ?')) {
      this.evaluationService.deleteEvaluation(evaluation.id!).subscribe({
        next: () => {
          this.evaluations = this.evaluations.filter(e => e.id !== evaluation.id);
          this.snackBar.open('Évaluation supprimée avec succès', 'Fermer', { duration: 3000 });
        },
        error: (error) => {
          console.error('Erreur lors de la suppression:', error);
          this.snackBar.open('Erreur lors de la suppression', 'Fermer', { duration: 3000 });
        }
      });
    }
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getAverageRating(evaluation: Evaluation): number {
    const ratings = [
      evaluation.generalRating,
      evaluation.serviceQualityRating,
      evaluation.punctualityRating,
      evaluation.communicationRating
    ];
    return ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length;
  }

  getOverallAverageRating(): string {
    if (this.evaluations.length === 0) return '0.0';
    
    const totalAverage = this.evaluations.reduce((sum, evaluation) => {
      return sum + this.getAverageRating(evaluation);
    }, 0) / this.evaluations.length;
    
    return totalAverage.toFixed(1);
  }
}
