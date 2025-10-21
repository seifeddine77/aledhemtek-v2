import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { Router } from '@angular/router';
import { ReservationService } from '../../services/reservation.service';
import { AuthService } from '../../services/auth.service';
import { Reservation, ReservationStatus } from '../../models/reservation.model';

@Component({
  selector: 'app-client-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatChipsModule
  ],
  templateUrl: './client-dashboard.component.html',
  styleUrl: './client-dashboard.component.css'
})
export class ClientDashboardComponent implements OnInit {
  loading = false;
  clientId: number = 0;
  
  // Statistics
  totalReservations = 0;
  pendingReservations = 0;
  completedReservations = 0;
  totalSpent = 0;
  
  // Recent reservations
  recentReservations: Reservation[] = [];
  
  // Quick stats
  stats = {
    thisMonth: 0,
    avgRating: 0,
    favoriteService: 'N/A'
  };

  constructor(
    private reservationService: ReservationService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.clientId = this.authService.getCurrentUserId();
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    this.loading = true;
    
    this.reservationService.getReservationsByClient(this.clientId).subscribe({
      next: (reservations) => {
        this.calculateStatistics(reservations);
        this.recentReservations = reservations
          .sort((a, b) => new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime())
          .slice(0, 5);
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading dashboard data:', error);
        this.loading = false;
      }
    });
  }

  calculateStatistics(reservations: Reservation[]): void {
    this.totalReservations = reservations.length;
    this.pendingReservations = reservations.filter(r => r.status === ReservationStatus.PENDING || r.status === ReservationStatus.ASSIGNED).length;
    this.completedReservations = reservations.filter(r => r.status === ReservationStatus.COMPLETED).length;
    
    // Calculate total spent (if totalPrice is available)
    this.totalSpent = reservations
      .filter(r => r.totalPrice)
      .reduce((sum, r) => sum + (r.totalPrice || 0), 0);
    
    // This month reservations
    const thisMonth = new Date();
    thisMonth.setDate(1);
    this.stats.thisMonth = reservations.filter(r => 
      new Date(r.createdAt || '') >= thisMonth
    ).length;
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

  createNewReservation(): void {
    this.router.navigate(['/client/create-reservation-with-tasks']);
  }

  viewAllReservations(): void {
    this.router.navigate(['/client/reservations']);
  }

  viewMyEvaluations(): void {
    this.router.navigate(['/client/evaluations']);
  }

  viewMyInvoices(): void {
    this.router.navigate(['/client/invoices']);
  }

  viewReservationDetails(reservationId: number): void {
    // Navigate to reservation details (to be implemented)
    console.log('View reservation details:', reservationId);
  }
}
