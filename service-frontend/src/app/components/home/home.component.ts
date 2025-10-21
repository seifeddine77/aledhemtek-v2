import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { HttpClientModule } from '@angular/common/http';
import { Subscription } from 'rxjs';
import { PublicService } from '../../services/public.service';
import { EvaluationService } from '../../services/evaluation.service';
import { ReservationService } from '../../services/reservation.service';
import { AuthService } from '../../services/auth.service';
import { ServiceDto } from '../../models/service.model';
import { Evaluation } from '../../models/evaluation.model';
import { Reservation } from '../../models/reservation.model';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatGridListModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatExpansionModule,
    MatDividerModule,
    HttpClientModule
  ],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css', './home-modern.css']
})
export class Home implements OnInit, OnDestroy {
  showScrollTopBtn = false;
  services: ServiceDto[] = [];
  recentEvaluations: Evaluation[] = [];
  reservations: Map<number, Reservation> = new Map();
  loadingEvaluations = true;
  isLoggedIn = false;
  userRole: string | null = null;
  private authSubscription!: Subscription;

  constructor(
    private publicService: PublicService,
    private evaluationService: EvaluationService,
    private reservationService: ReservationService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    // Initialiser l'état d'authentification
    this.authSubscription = this.authService.getAuthStatusListener().subscribe((isAuthenticated: boolean) => {
      this.isLoggedIn = isAuthenticated;
      if (this.isLoggedIn) {
        this.userRole = this.authService.getRole();
      } else {
        this.userRole = null;
      }
    });

    this.animateSections();
    window.addEventListener('scroll', this.onScroll, true);
    setTimeout(() => this.animateSections(), 100); // Pour l'affichage initial
    this.getAllServices();
    this.loadRecentEvaluations();
  }

  ngOnDestroy() {
    window.removeEventListener('scroll', this.onScroll, true);
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
  }

  onScroll = () => {
    this.showScrollTopBtn = window.scrollY > 300;
    this.animateSections();
  };

  scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  animateSections() {
    const sections = document.querySelectorAll('.section-animate');
    sections.forEach((section: any) => {
      const rect = section.getBoundingClientRect();
      if (rect.top < window.innerHeight - 80) {
        section.classList.add('visible');
      }
    });
  }

  getAllServices() {
    this.publicService.getAllServices().subscribe({
      next: (res) => {
        // Limiter à 6 services maximum pour la page d'accueil
        const limitedServices = res.slice(0, 6);
        this.services = limitedServices.map((service: ServiceDto) => ({
          ...service,
          processedImg: this.getServiceImageUrl(service)
        }));
        console.log('Services chargés (limités à 6):', this.services);
      },
      error: (error) => {
        console.error('Erreur lors du chargement des services:', error);
        // Ajouter des services par défaut pour la démo
        this.services = this.getDefaultServices();
      }
    });
  }

  private getServiceImageUrl(service: ServiceDto): string {
    // Si on a une image base64, l'utiliser
    if (service.returnedImage) {
      return 'data:image/jpeg;base64,' + service.returnedImage;
    }
    
    // Si on a un nom de fichier dans img, construire l'URL
    if (service.img) {
      // Nettoyer le nom de fichier (enlever le préfixe services/ s'il existe)
      const cleanImageName = service.img.startsWith('services/') ? service.img.substring(9) : service.img;
      return `http://localhost:8080/uploads/services/${cleanImageName}`;
    }
    
    // Image par défaut
    return 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=800&q=80';
  }

  private getDefaultServices(): ServiceDto[] {
    return [
      {
        id: 1,
        name: 'Plomberie',
        description: 'Réparation et installation de plomberie',
        price: 50,
        returnedImage: '',
        processedImg: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=800&q=80'
      },
      {
        id: 2,
        name: 'Électricité',
        description: 'Installation et réparation électrique',
        price: 60,
        returnedImage: '',
        processedImg: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=800&q=80'
      },
      {
        id: 3,
        name: 'Ménage',
        description: 'Service de ménage à domicile',
        price: 25,
        returnedImage: '',
        processedImg: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=800&q=80'
      },
      {
        id: 4,
        name: 'Jardinage',
        description: 'Entretien de jardin et espaces verts',
        price: 40,
        returnedImage: '',
        processedImg: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?auto=format&fit=crop&w=800&q=80'
      }
    ];
  }

  onImageError(event: any) {
    // Remplacer par une image par défaut en cas d'erreur
    event.target.src = 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=800&q=80';
  }

  loadRecentEvaluations() {
    // Charger les évaluations mises en avant pour la page d'accueil (endpoint public)
    this.evaluationService.getFeaturedEvaluationsForHome().subscribe({
      next: (evaluations) => {
        this.recentEvaluations = evaluations;
        this.loadReservationDetails();
      },
      error: (error) => {
        console.error('Erreur lors du chargement des évaluations:', error);
        this.loadingEvaluations = false;
      }
    });
  }

  private loadReservationDetails(): void {
    const reservationIds = [...new Set(this.recentEvaluations.map(e => e.reservationId))];
    let loadedCount = 0;

    if (reservationIds.length === 0) {
      this.loadingEvaluations = false;
      return;
    }

    reservationIds.forEach(id => {
      this.reservationService.getReservationById(id).subscribe({
        next: (reservation) => {
          this.reservations.set(id, reservation);
          loadedCount++;
          if (loadedCount === reservationIds.length) {
            this.loadingEvaluations = false;
          }
        },
        error: (error) => {
          console.error(`Erreur lors du chargement de la réservation ${id}:`, error);
          loadedCount++;
          if (loadedCount === reservationIds.length) {
            this.loadingEvaluations = false;
          }
        }
      });
    });
  }

  getEvaluationAverage(evaluation: Evaluation): number {
    return (
      evaluation.generalRating +
      evaluation.serviceQualityRating +
      evaluation.punctualityRating +
      evaluation.communicationRating
    ) / 4;
  }

  getStarArray(rating: number): number[] {
    return Array(5).fill(0).map((_, i) => i + 1);
  }

  getReservation(reservationId: number): Reservation | undefined {
    return this.reservations.get(reservationId);
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  // Méthodes pour la gestion dynamique des boutons
  handleReservation(serviceId: number) {
    if (this.isLoggedIn) {
      // Si connecté, rediriger vers la page de réservation
      this.router.navigate(['/booking', serviceId]);
    } else {
      // Si non connecté, rediriger vers login
      this.router.navigate(['/login']);
    }
  }

  handleSignup() {
    if (this.isLoggedIn) {
      // Si connecté, rediriger vers le dashboard approprié
      this.redirectToDashboard();
    } else {
      // Si non connecté, rediriger vers signup
      this.router.navigate(['/register']);
    }
  }

  private redirectToDashboard() {
    switch (this.userRole) {
      case 'admin':
        this.router.navigate(['/admin/dashboard']);
        break;
      case 'client':
        this.router.navigate(['/client/dashboard']);
        break;
      case 'consultant':
        this.router.navigate(['/consultant/dashboard']);
        break;
      default:
        this.router.navigate(['/']);
    }
  }

  getSignupButtonText(): string {
    if (this.isLoggedIn) {
      return 'Mon Dashboard';
    }
    return 'Commencer';
  }

  getReservationButtonText(): string {
    if (this.isLoggedIn) {
      return 'Réserver maintenant';
    }
    return 'Se connecter pour réserver';
  }

  handleViewAllServices() {
    if (this.isLoggedIn) {
      // Si connecté, aller directement aux services
      this.router.navigate(['/services']);
    } else {
      // Si non connecté, rediriger vers login avec redirect
      this.router.navigate(['/login'], { queryParams: { returnUrl: '/services' } });
    }
  }

  getViewAllServicesText(): string {
    if (this.isLoggedIn) {
      return 'Voir tous les services';
    }
    return 'Se connecter pour voir tous les services';
  }



  /**
   * Obtenir le nom du client pour une évaluation
   */
  getClientName(evaluation: Evaluation): string {
    const reservation = this.reservations.get(evaluation.reservationId);
    return reservation?.clientName || 'Client';
  }

  /**
   * Obtenir le titre du service pour une évaluation
   */
  getServiceTitle(evaluation: Evaluation): string {
    const reservation = this.reservations.get(evaluation.reservationId);
    return reservation?.title || 'Service';
  }

  /**
   * Obtenir le nom du consultant pour une évaluation
   */
  getConsultantName(evaluation: Evaluation): string {
    const reservation = this.reservations.get(evaluation.reservationId);
    return reservation?.consultantName || 'Consultant';
  }

  /**
   * Générer un tableau d'étoiles pour l'affichage
   */
  getStarsArray(rating: number): boolean[] {
    return Array(5).fill(false).map((_, i) => i < Math.round(rating));
  }

  /**
   * Formater la date de l'évaluation
   */
  formatEvaluationDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }


}
