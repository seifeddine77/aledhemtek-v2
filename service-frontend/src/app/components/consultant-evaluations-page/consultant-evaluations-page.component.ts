import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { EvaluationService } from '../../services/evaluation.service';
import { AuthService } from '../../services/auth.service';
import { ReservationService } from '../../services/reservation.service';
import { Evaluation } from '../../models/evaluation.model';
import { Reservation } from '../../models/reservation.model';

@Component({
  selector: 'app-consultant-evaluations-page',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatDividerModule,
    MatTooltipModule
  ],
  templateUrl: './consultant-evaluations-page.component.html',
  styleUrls: ['./consultant-evaluations-page.component.css']
})
export class ConsultantEvaluationsPageComponent implements OnInit {
  evaluations: Evaluation[] = [];
  reservations: Map<number, Reservation> = new Map();
  loading = true;
  currentUserId: number | null = null;

  // Statistics
  stats = {
    totalEvaluations: 0,
    averageRating: 0,
    averageGeneralRating: 0,
    averageServiceQuality: 0,
    averagePunctuality: 0,
    averageCommunication: 0,
    excellentCount: 0,
    goodCount: 0,
    averageCount: 0,
    poorCount: 0
  };

  constructor(
    private evaluationService: EvaluationService,
    private authService: AuthService,
    private reservationService: ReservationService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.currentUserId = this.authService.getCurrentUserId();
    if (this.currentUserId) {
      this.loadConsultantEvaluations();
    }
  }

  loadConsultantEvaluations(): void {
    if (!this.currentUserId) return;

    this.loading = true;
    this.evaluationService.getConsultantEvaluations(this.currentUserId).subscribe({
      next: (evaluations) => {
        this.evaluations = evaluations.sort((a, b) => 
          new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime()
        );
        this.calculateStatistics();
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

  calculateStatistics(): void {
    this.stats.totalEvaluations = this.evaluations.length;

    if (this.evaluations.length === 0) return;

    // Calculate averages
    const totalGeneral = this.evaluations.reduce((sum, e) => sum + e.generalRating, 0);
    const totalServiceQuality = this.evaluations.reduce((sum, e) => sum + e.serviceQualityRating, 0);
    const totalPunctuality = this.evaluations.reduce((sum, e) => sum + e.punctualityRating, 0);
    const totalCommunication = this.evaluations.reduce((sum, e) => sum + e.communicationRating, 0);

    this.stats.averageGeneralRating = totalGeneral / this.evaluations.length;
    this.stats.averageServiceQuality = totalServiceQuality / this.evaluations.length;
    this.stats.averagePunctuality = totalPunctuality / this.evaluations.length;
    this.stats.averageCommunication = totalCommunication / this.evaluations.length;

    // Overall average
    this.stats.averageRating = (
      this.stats.averageGeneralRating +
      this.stats.averageServiceQuality +
      this.stats.averagePunctuality +
      this.stats.averageCommunication
    ) / 4;

    // Rating distribution
    this.evaluations.forEach(evaluation => {
      const avgRating = this.getEvaluationAverage(evaluation);
      if (avgRating >= 4.5) this.stats.excellentCount++;
      else if (avgRating >= 3.5) this.stats.goodCount++;
      else if (avgRating >= 2.5) this.stats.averageCount++;
      else this.stats.poorCount++;
    });
  }

  getReservation(reservationId: number): Reservation | undefined {
    return this.reservations.get(reservationId);
  }

  getStarArray(rating: number): number[] {
    return Array(5).fill(0).map((_, i) => i + 1);
  }

  getEvaluationAverage(evaluation: Evaluation): number {
    return (
      evaluation.generalRating +
      evaluation.serviceQualityRating +
      evaluation.punctualityRating +
      evaluation.communicationRating
    ) / 4;
  }

  getRatingColor(rating: number): string {
    if (rating >= 4.5) return '#4caf50'; // Green
    if (rating >= 3.5) return '#ff9800'; // Orange
    if (rating >= 2.5) return '#f44336'; // Red
    return '#9e9e9e'; // Grey
  }

  getRatingText(rating: number): string {
    if (rating >= 4.5) return 'Excellent';
    if (rating >= 3.5) return 'Très bien';
    if (rating >= 2.5) return 'Bien';
    if (rating >= 1.5) return 'Moyen';
    return 'Insuffisant';
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

  getPercentage(count: number): number {
    return this.stats.totalEvaluations > 0 ? (count / this.stats.totalEvaluations) * 100 : 0;
  }
}
