import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';
import { NotificationService } from '../../services/notification.service';

@Component({
  standalone: true,
  selector: 'app-admin-dashboard',
  imports: [
    CommonModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    RouterModule
  ],
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.css'
})
export class AdminDashboardComponent implements OnInit {

  constructor(private notificationService: NotificationService) {}

  ngOnInit(): void {
    // Charger les notifications existantes
    this.notificationService.loadStoredNotifications();
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
