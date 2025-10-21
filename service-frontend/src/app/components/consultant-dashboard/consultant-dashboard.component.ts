import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { MatTableModule } from '@angular/material/table';
import { Router } from '@angular/router';
import { ReservationService } from '../../services/reservation.service';
import { AuthService } from '../../services/auth.service';
import { EvaluationService } from '../../services/evaluation.service';
import { Reservation, ReservationStatus } from '../../models/reservation.model';
import { Evaluation } from '../../models/evaluation.model';

@Component({
  selector: 'app-consultant-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatChipsModule,
    MatTableModule
  ],
  templateUrl: './consultant-dashboard.component.html',
  styleUrl: './consultant-dashboard.component.css'
})
export class ConsultantDashboardComponent implements OnInit {
  loading = false;
  consultantId: number = 0;
  
  // Statistics
  totalAssignments = 0;
  pendingAssignments = 0;
  completedAssignments = 0;
  todayAssignments = 0;
  
  // Recent assignments
  recentAssignments: Reservation[] = [];
  todayReservations: Reservation[] = [];
  
  // Performance stats
  stats = {
    thisWeek: 0,
    thisMonth: 0,
    avgRating: 0,
    totalEarnings: 0
  };

  // Evaluation stats
  evaluationStats = {
    totalEvaluations: 0,
    averageRating: 0,
    averageGeneralRating: 0,
    averageServiceQuality: 0,
    averagePunctuality: 0,
    averageCommunication: 0,
    recentEvaluations: [] as Evaluation[]
  };

  constructor(
    private reservationService: ReservationService,
    private authService: AuthService,
    private evaluationService: EvaluationService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.consultantId = this.authService.getCurrentUserId();
    this.loadDashboardData();
    this.loadEvaluationStats();
  }

  loadDashboardData(): void {
    this.loading = true;
    
    this.reservationService.getReservationsByConsultant(this.consultantId).subscribe({
      next: (reservations) => {
        this.calculateStatistics(reservations);
        this.recentAssignments = reservations
          .sort((a, b) => new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime())
          .slice(0, 5);
        
        // Today's reservations
        const today = new Date();
        this.todayReservations = reservations.filter(r => {
          const reservationDate = new Date(r.startDate);
          return reservationDate.toDateString() === today.toDateString();
        });
        
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading dashboard data:', error);
        this.loading = false;
      }
    });
  }

  calculateStatistics(reservations: Reservation[]): void {
    this.totalAssignments = reservations.length;
    this.pendingAssignments = reservations.filter(r => 
      r.status === ReservationStatus.ASSIGNED || r.status === ReservationStatus.PENDING
    ).length;
    this.completedAssignments = reservations.filter(r => 
      r.status === ReservationStatus.COMPLETED
    ).length;
    
    // Today's assignments
    const today = new Date();
    this.todayAssignments = reservations.filter(r => {
      const reservationDate = new Date(r.startDate);
      return reservationDate.toDateString() === today.toDateString();
    }).length;
    
    // This week assignments
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    this.stats.thisWeek = reservations.filter(r => 
      new Date(r.startDate) >= startOfWeek
    ).length;
    
    // This month assignments
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    this.stats.thisMonth = reservations.filter(r => 
      new Date(r.startDate) >= startOfMonth
    ).length;
    
    // Calculate potential earnings (if totalPrice is available)
    this.stats.totalEarnings = reservations
      .filter(r => r.status === ReservationStatus.COMPLETED && r.totalPrice)
      .reduce((sum, r) => sum + (r.totalPrice || 0), 0);
  }

  loadEvaluationStats(): void {
    // Load consultant evaluations
    this.evaluationService.getConsultantEvaluations(this.consultantId).subscribe({
      next: (evaluations) => {
        this.calculateEvaluationStatistics(evaluations);
      },
      error: (error) => {
        console.error('Error loading evaluation stats:', error);
      }
    });
  }

  calculateEvaluationStatistics(evaluations: Evaluation[]): void {
    this.evaluationStats.totalEvaluations = evaluations.length;
    this.evaluationStats.recentEvaluations = evaluations
      .sort((a, b) => new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime())
      .slice(0, 3);

    if (evaluations.length > 0) {
      // Calculate averages
      const totalGeneral = evaluations.reduce((sum, e) => sum + e.generalRating, 0);
      const totalServiceQuality = evaluations.reduce((sum, e) => sum + e.serviceQualityRating, 0);
      const totalPunctuality = evaluations.reduce((sum, e) => sum + e.punctualityRating, 0);
      const totalCommunication = evaluations.reduce((sum, e) => sum + e.communicationRating, 0);

      this.evaluationStats.averageGeneralRating = totalGeneral / evaluations.length;
      this.evaluationStats.averageServiceQuality = totalServiceQuality / evaluations.length;
      this.evaluationStats.averagePunctuality = totalPunctuality / evaluations.length;
      this.evaluationStats.averageCommunication = totalCommunication / evaluations.length;

      // Overall average
      this.evaluationStats.averageRating = (
        this.evaluationStats.averageGeneralRating +
        this.evaluationStats.averageServiceQuality +
        this.evaluationStats.averagePunctuality +
        this.evaluationStats.averageCommunication
      ) / 4;

      // Update the main stats avgRating for consistency
      this.stats.avgRating = this.evaluationStats.averageRating;
    }
  }

  getStarArray(rating: number): number[] {
    return Array(5).fill(0).map((_, i) => i + 1);
  }

  viewMyEvaluations(): void {
    this.router.navigate(['/consultant/evaluations']);
  }

  getStatusColor(status: ReservationStatus): string {
    switch (status) {
      case ReservationStatus.PENDING: return '#ff9800';
      case ReservationStatus.ASSIGNED: return '#2196f3';
      case ReservationStatus.IN_PROGRESS: return '#4caf50';
      case ReservationStatus.COMPLETED: return '#8bc34a';
      case ReservationStatus.CANCELLED: return '#f44336';
      default: return '#9e9e9e';
    }
  }

  getStatusText(status: ReservationStatus): string {
    switch (status) {
      case ReservationStatus.PENDING: return 'En attente';
      case ReservationStatus.ASSIGNED: return 'Assignée';
      case ReservationStatus.IN_PROGRESS: return 'En cours';
      case ReservationStatus.COMPLETED: return 'Terminée';
      case ReservationStatus.CANCELLED: return 'Annulée';
      default: return status;
    }
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }

  formatTime(dateString: string): string {
    return new Date(dateString).toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  viewCalendar(): void {
    this.router.navigate(['/consultant/calendar']);
  }

  viewAllTasks(): void {
    this.router.navigate(['/consultant/tasks']);
  }

  startAssignment(reservationId: number): void {
    this.reservationService.updateReservationStatus(reservationId, ReservationStatus.IN_PROGRESS).subscribe({
      next: () => {
        this.loadDashboardData();
      },
      error: (error) => {
        console.error('Error starting assignment:', error);
      }
    });
  }

  completeAssignment(reservationId: number): void {
    this.reservationService.updateReservationStatus(reservationId, ReservationStatus.COMPLETED).subscribe({
      next: () => {
        this.loadDashboardData();
      },
      error: (error) => {
        console.error('Error completing assignment:', error);
      }
    });
  }
}
