import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';
import { NotificationService } from '../../services/notification.service';
import { ReservationService } from '../../services/reservation.service';
import { AdminService } from '../../services/admin.service';
import { Reservation } from '../../models/reservation.model';
import { CleanTextPipe } from '../../pipes/clean-text.pipe';

@Component({
  standalone: true,
  selector: 'app-admin-dashboard',
  imports: [
    CommonModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    RouterModule,
    CleanTextPipe
  ],
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.css'
})
export class AdminDashboardComponent implements OnInit {
  todayDate = new Date();
  totalReservations = 0;
  unassignedCount = 0;
  inProgressCount = 0;
  completedCount = 0;
  totalServices = 0;
  recentReservations: Reservation[] = [];
  unassignedReservations: Reservation[] = [];
  loading = true;

  constructor(
    private notificationService: NotificationService,
    private reservationService: ReservationService,
    private adminService: AdminService
  ) {}

  ngOnInit(): void {
    this.notificationService.loadStoredNotifications();
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    this.loading = true;
    
    // Charger toutes les réservations
    this.reservationService.getAllReservations().subscribe({
      next: (reservations) => {
        this.totalReservations = reservations.length;
        this.inProgressCount = reservations.filter(r => r.status === 'IN_PROGRESS').length;
        this.completedCount = reservations.filter(r => r.status === 'COMPLETED').length;
        this.recentReservations = reservations.slice(0, 5);
        this.loading = false;
      },
      error: (err) => {
        console.error('Erreur chargement réservations:', err);
        this.loading = false;
      }
    });

    // Charger les réservations non assignées
    this.reservationService.getUnassignedReservations().subscribe({
      next: (unassigned) => {
        this.unassignedReservations = unassigned;
        this.unassignedCount = unassigned.length;
      },
      error: (err) => {
        console.error('Erreur chargement non assignées:', err);
      }
    });

    // Charger le total des services
    this.adminService.getAllServices().subscribe({
      next: (services) => {
        this.totalServices = services ? services.length : 0;
      },
      error: (err) => {
        console.error('Erreur chargement services:', err);
      }
    });
  }

  formatDate(date: any): string {
    if (!date) return 'Date non spécifiée';
    try {
      const d = new Date(date);
      return d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    } catch {
      return String(date);
    }
  }

  getStatusText(status: string | undefined): string {
    switch (status) {
      case 'PENDING': return 'En Attente';
      case 'ASSIGNED': return 'Assignée';
      case 'IN_PROGRESS': return 'En Cours';
      case 'COMPLETED': return 'Terminée';
      case 'CANCELLED': return 'Annulée';
      default: return status || 'Inconnu';
    }
  }

  // Méthodes de test pour simuler des notifications
  simulateNewEvaluation(): void {
    const clients = ['Marie Dubois', 'Pierre Martin', 'Sophie Leroy', 'Jean Dupont'];
    const consultants = ['Dr. Smith', 'Ing. Durand', 'M. Bernard', 'Mme. Rousseau'];
    const ratings = [3.5, 4.0, 4.5, 5.0];
    
    const randomClient = clients[Math.floor(Math.random() * clients.length)];
    const randomConsultant = consultants[Math.floor(Math.random() * consultants.length)];
    const randomRating = ratings[Math.floor(Math.random() * ratings.length)];
    
    this.notificationService.notifyNewEvaluation(randomClient, randomConsultant, randomRating);
  }

  simulateSystemMessage(): void {
    const messages = [
      { title: 'Maintenance Programmée', message: 'Une maintenance système aura lieu ce soir de 22h à 2h.' },
      { title: 'Nouvelle Fonctionnalité', message: 'Le système de notifications est maintenant disponible !' },
      { title: 'Rapport Mensuel', message: 'Le rapport mensuel des évaluations est prêt à être consulté.' }
    ];
    
    const randomMessage = messages[Math.floor(Math.random() * messages.length)];
    this.notificationService.notifySystemMessage(randomMessage.title, randomMessage.message);
  }
}
