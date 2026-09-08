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
import { cleanText } from '../../pipes/clean-text.pipe';

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
  userName = 'Client';
  todayDate = '';
  
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

  quickServices = [
    { id: 'plomberie', name: 'Plomberie & Fuites', icon: 'plumbing', desc: 'Fuite d\'eau, robinet, évier, chasse d\'eau', color: '#2563eb', bg: 'rgba(37, 99, 235, 0.08)' },
    { id: 'electricite', name: 'Électricité Générale', icon: 'electrical_services', desc: 'Tableau, prises, disjoncteur, éclairage', color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.08)' },
    { id: 'serrurerie', name: 'Serrurerie & Accès', icon: 'lock_open', desc: 'Ouverture de porte, cylindre, blindage', color: '#10b981', bg: 'rgba(16, 185, 129, 0.08)' },
    { id: 'chauffage', name: 'Chauffage & Climatisation', icon: 'thermostat', desc: 'Chaudière, radiateur, purge, maintenance', color: '#ef4444', bg: 'rgba(239, 68, 68, 0.08)' },
    { id: 'peinture', name: 'Peinture & Finitions', icon: 'format_paint', desc: 'Rénovation murs, plafonds, finitions', color: '#8b5cf6', bg: 'rgba(139, 92, 246, 0.08)' },
    { id: 'debouchage', name: 'Canalisations & Curage', icon: 'water_damage', desc: 'Débouchage haute pression, curage rapide', color: '#06b6d4', bg: 'rgba(6, 182, 212, 0.08)' },
  ];

  constructor(
    private reservationService: ReservationService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.clientId = this.authService.getCurrentUserId();
    this.extractUserInfo();
    this.todayDate = new Intl.DateTimeFormat('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(new Date());
    this.loadDashboardData();
  }

  extractUserInfo(): void {
    try {
      const token = localStorage.getItem('jwt');
      if (token) {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const email = payload.sub || '';
        if (email) {
          const raw = email.split('@')[0];
          this.userName = raw.charAt(0).toUpperCase() + raw.slice(1);
        }
      }
    } catch (e) {
      this.userName = 'Client';
    }
  }

  loadDashboardData(): void {
    this.loading = true;
    
    this.reservationService.getReservationsByClient(this.clientId).subscribe({
      next: (reservations) => {
        const cleaned = (reservations || []).map(r => ({
          ...r,
          title: cleanText(r.title || ''),
          description: cleanText(r.description || '')
        }));
        this.calculateStatistics(cleaned);
        this.recentReservations = cleaned
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
    this.router.navigate(['/client/reservations']);
  }

  getActiveReservation(): Reservation | undefined {
    return this.recentReservations.find(r => 
      r.status === ReservationStatus.IN_PROGRESS || 
      r.status === ReservationStatus.ASSIGNED || 
      r.status === ReservationStatus.PENDING
    );
  }

  orderTrade(tradeName: string): void {
    this.router.navigate(['/client/create-reservation-with-tasks'], {
      queryParams: { category: tradeName }
    });
  }
}

