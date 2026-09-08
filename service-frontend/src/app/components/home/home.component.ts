import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { HttpClientModule } from '@angular/common/http';
import { Subscription } from 'rxjs';
import { PublicService } from '../../services/public.service';
import { EvaluationService } from '../../services/evaluation.service';
import { AuthService } from '../../services/auth.service';
import { ServiceDto } from '../../models/service.model';
import { Evaluation } from '../../models/evaluation.model';
import { environment } from '../../../environments/environment';

export interface FaqItem {
  question: string;
  answer: string;
  category: string;
  isOpen: boolean;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatTooltipModule,
    HttpClientModule
  ],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css', './home-modern.css']
})
export class Home implements OnInit, OnDestroy {
  showScrollTopBtn = false;
  
  // Données dynamiques
  categories: any[] = [];
  services: ServiceDto[] = [];
  filteredServices: ServiceDto[] = [];
  recentEvaluations: Evaluation[] = [];
  
  // États de filtrage interactif
  selectedCategoryId: number | null = null;
  searchQuery = '';
  
  // États de chargement
  loadingServices = true;
  loadingCategories = true;
  loadingEvaluations = true;
  
  // État d'authentification
  isLoggedIn = false;
  userRole: string | null = null;
  private authSubscription!: Subscription;

  // FAQ interactive
  faqItems: FaqItem[] = [
    {
      question: "Comment sont sélectionnés les professionnels AledhemTek ?",
      answer: "Tous nos artisans partenaires font l'objet d'une sélection stricte : vérification de l'assurance décennale et RC Pro, contrôle des diplômes d'État, kbis, et entretiens de qualification technique.",
      category: "Sécurité & Garantie",
      isOpen: true
    },
    {
      question: "Comment fonctionne le paiement sécurisé par séquestre ?",
      answer: "Votre règlement est sécurisé via notre partenaire bancaire Stripe certifié PCI-DSS. Les fonds ne sont libérés au professionnel qu'après exécution complète de la prestation et validation de votre satisfaction.",
      category: "Paiement",
      isOpen: false
    },
    {
      question: "Que se passe-t-il si un imprévu survient lors de l'intervention ?",
      answer: "Chaque prestation réalisée via la plateforme est couverte par notre garantie d'intervention. En cas de besoin, notre support client basé en France intervient 7j/7 pour vous apporter une solution immédiate.",
      category: "Assistance",
      isOpen: false
    },
    {
      question: "Puis-je annuler ou reporter un rendez-vous gratuitement ?",
      answer: "Absolument. Vous pouvez modifier ou annuler votre réservation sans aucun frais jusqu'à 24 heures avant l'horaire prévu, directement depuis votre tableau de bord client.",
      category: "Réservation",
      isOpen: false
    },
    {
      question: "Qui fournit les matériaux et pièces détachées nécessaires ?",
      answer: "Les artisans se déplacent toujours avec leur outillage professionnel complet. Vous pouvez fournir vos propres matériaux ou confier l'achat des pièces nécessaires à l'artisan au tarif coûtant avec facture à l'appui.",
      category: "Prestation",
      isOpen: false
    }
  ];

  // Images par défaut pour chaque univers métier
  private categoryImages: Record<string, string> = {
    'plomberie': 'https://images.unsplash.com/photo-1585704032915-c3400ca199e7?auto=format&fit=crop&w=800&q=80',
    'electricite': 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=800&q=80',
    'peinture': 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&w=800&q=80',
    'bricolage': 'https://images.unsplash.com/photo-1581783342308-f792dbdd27c5?auto=format&fit=crop&w=800&q=80',
    'jardinage': 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?auto=format&fit=crop&w=800&q=80',
    'chauffage': 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?auto=format&fit=crop&w=800&q=80',
    'serrurerie': 'https://images.unsplash.com/photo-1558002038-1055907df827?auto=format&fit=crop&w=800&q=80',
    'nettoyage': 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=800&q=80'
  };

  constructor(
    private publicService: PublicService,
    private evaluationService: EvaluationService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.authSubscription = this.authService.getAuthStatusListener().subscribe((isAuthenticated: boolean) => {
      this.isLoggedIn = isAuthenticated;
      this.userRole = isAuthenticated ? this.authService.getRole() : null;
    });

    window.addEventListener('scroll', this.onScroll, true);
    
    this.loadCategories();
    this.loadServices();
    this.loadFeaturedEvaluations();
  }

  ngOnDestroy() {
    window.removeEventListener('scroll', this.onScroll, true);
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
  }

  onScroll = () => {
    this.showScrollTopBtn = window.scrollY > 400;
  };

  scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  scrollToServices() {
    const el = document.getElementById('services-showcase');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  }

  // Chargement des catégories
  loadCategories() {
    this.loadingCategories = true;
    this.publicService.getAllCategories().subscribe({
      next: (cats) => {
        this.categories = cats || [];
        this.loadingCategories = false;
      },
      error: (err) => {
        console.warn('Fallback catégories:', err);
        this.categories = this.getDefaultCategories();
        this.loadingCategories = false;
      }
    });
  }

  // Chargement des services
  loadServices() {
    this.loadingServices = true;
    this.publicService.getAllServices().subscribe({
      next: (services) => {
        this.services = (services || []).map((s: ServiceDto) => ({
          ...s,
          processedImg: this.getServiceImageUrl(s)
        }));
        this.filteredServices = [...this.services];
        this.loadingServices = false;
      },
      error: (err) => {
        console.warn('Fallback services:', err);
        this.services = this.getDefaultServices();
        this.filteredServices = [...this.services];
        this.loadingServices = false;
      }
    });
  }

  // Chargement des évaluations
  loadFeaturedEvaluations() {
    this.loadingEvaluations = true;
    this.evaluationService.getFeaturedEvaluationsForHome().subscribe({
      next: (evals) => {
        this.recentEvaluations = evals || [];
        this.loadingEvaluations = false;
      },
      error: (err) => {
        console.warn('Fallback évaluations:', err);
        this.recentEvaluations = this.getDefaultEvaluations();
        this.loadingEvaluations = false;
      }
    });
  }

  // Filtrage réactif par catégorie
  selectCategory(catId: number | null) {
    this.selectedCategoryId = catId;
    this.applyFilters();
  }

  // Recherche réactive par texte
  onSearchChange() {
    this.applyFilters();
  }

  applyFilters() {
    const query = (this.searchQuery || '').trim().toLowerCase();

    this.filteredServices = this.services.filter(s => {
      // Filtre catégorie
      const matchCategory = !this.selectedCategoryId || 
        s.categoryId === this.selectedCategoryId ||
        ((s as any).category && (s as any).category.id === this.selectedCategoryId);

      // Filtre texte
      const matchQuery = !query || 
        (s.name && s.name.toLowerCase().includes(query)) ||
        (s.description && s.description.toLowerCase().includes(query));

      return matchCategory && matchQuery;
    });
  }

  resetFilters() {
    this.searchQuery = '';
    this.selectedCategoryId = null;
    this.filteredServices = [...this.services];
  }

  // FAQ Accordion Toggle
  toggleFaq(index: number) {
    this.faqItems[index].isOpen = !this.faqItems[index].isOpen;
  }

  // Gestion des réservations
  handleReservation(serviceId: number) {
    if (this.isLoggedIn) {
      this.router.navigate(['/client/create-reservation-with-tasks'], { 
        queryParams: { serviceId: serviceId } 
      });
    } else {
      this.router.navigate(['/login'], { 
        queryParams: { returnUrl: `/client/create-reservation-with-tasks?serviceId=${serviceId}` } 
      });
    }
  }

  handleSignup() {
    if (this.isLoggedIn) {
      this.redirectToDashboard();
    } else {
      this.router.navigate(['/register']);
    }
  }

  private redirectToDashboard() {
    switch (this.userRole) {
      case 'ADMIN':
      case 'admin':
        this.router.navigate(['/admin/dashboard']);
        break;
      case 'CLIENT':
      case 'client':
        this.router.navigate(['/client/dashboard']);
        break;
      case 'CONSULTANT':
      case 'consultant':
        this.router.navigate(['/consultant/dashboard']);
        break;
      default:
        this.router.navigate(['/client/dashboard']);
    }
  }

  getServiceImageUrl(service: ServiceDto): string {
    if (service.returnedImage) {
      return 'data:image/jpeg;base64,' + service.returnedImage;
    }
    if (service.img) {
      const cleanImageName = service.img.startsWith('services/') ? service.img.substring(9) : service.img;
      return `${environment.uploadsUrl}/services/${cleanImageName}`;
    }
    
    // Déterminer l'image selon le nom
    const nameLower = (service.name || '').toLowerCase();
    for (const key of Object.keys(this.categoryImages)) {
      if (nameLower.includes(key)) {
        return this.categoryImages[key];
      }
    }
    return this.categoryImages['plomberie'];
  }

  onImageError(event: any, service: ServiceDto) {
    const nameLower = (service.name || '').toLowerCase();
    for (const key of Object.keys(this.categoryImages)) {
      if (nameLower.includes(key)) {
        event.target.src = this.categoryImages[key];
        return;
      }
    }
    event.target.src = 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=800&q=80';
  }

  getStarArray(rating: number): number[] {
    return Array(5).fill(0).map((_, i) => i + 1);
  }

  formatDate(dateString: string | undefined): string {
    if (!dateString) return 'Récemment';
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  // Données de secours fiables
  private getDefaultCategories(): any[] {
    return [
      { id: 1, name: 'Plomberie & Sanitaire', icon: 'plumbing' },
      { id: 2, name: 'Électricité & Domotique', icon: 'electric_bolt' },
      { id: 3, name: 'Peinture & Décoration', icon: 'format_paint' },
      { id: 4, name: 'Bricolage & Menuiserie', icon: 'handyman' },
      { id: 5, name: 'Jardinage & Extérieurs', icon: 'yard' },
      { id: 6, name: 'Climatisation & Chauffage', icon: 'hvac' },
      { id: 7, name: 'Serrurerie & Sécurité', icon: 'lock' },
      { id: 8, name: 'Nettoyage & Entretien', icon: 'cleaning_services' }
    ];
  }

  private getDefaultServices(): ServiceDto[] {
    return [
      {
        id: 1,
        name: 'Recherche & Réparation de Fuite',
        description: 'Diagnostic précis par caméra thermique et réparation immédiate de fuite d\'eau.',
        price: 65,
        categoryId: 1,
        returnedImage: '',
        processedImg: this.categoryImages['plomberie']
      },
      {
        id: 2,
        name: 'Rénovation Tableau Électrique',
        description: 'Mise en sécurité totale selon norme NF C 15-100 avec disjoncteurs différentiels.',
        price: 120,
        categoryId: 2,
        returnedImage: '',
        processedImg: this.categoryImages['electricite']
      },
      {
        id: 3,
        name: 'Peinture Murs & Plafonds',
        description: 'Préparation minutieuse des supports, application de 2 couches satinées ou mates.',
        price: 40,
        categoryId: 3,
        returnedImage: '',
        processedImg: this.categoryImages['peinture']
      },
      {
        id: 4,
        name: 'Montage Meubles & Dressings',
        description: 'Assemblage rigoureux de dressings, buffets, canapés et meubles toutes marques.',
        price: 35,
        categoryId: 4,
        returnedImage: '',
        processedImg: this.categoryImages['bricolage']
      },
      {
        id: 5,
        name: 'Tonte de Pelouse & Débroussaillage',
        description: 'Tonte soignée avec finitions au coupe-bordure et évacuation des déchets verts.',
        price: 45,
        categoryId: 5,
        returnedImage: '',
        processedImg: this.categoryImages['jardinage']
      },
      {
        id: 6,
        name: 'Entretien & Désinfection Climatiseur',
        description: 'Nettoyage des filtres, désinfection de l\'évaporateur et contrôle des fluides.',
        price: 85,
        categoryId: 6,
        returnedImage: '',
        processedImg: this.categoryImages['chauffage']
      }
    ];
  }

  private getDefaultEvaluations(): Evaluation[] {
    return [
      {
        id: 1,
        comment: "Artisan d'un professionnalisme exemplaire ! La fuite sous l'évier a été colmatée en un temps record avec un travail impeccable et de bons conseils préventifs.",
        generalRating: 5,
        serviceQualityRating: 5,
        punctualityRating: 5,
        communicationRating: 5,
        clientId: 2,
        reservationId: 1,
        createdAt: '2026-02-15T12:00:00Z'
      },
      {
        id: 2,
        comment: "Remise aux normes de mon tableau électrique exécutée avec une grande rigueur. Tout est bien étiqueté, propre et sécurisé. Je recommande les yeux fermés !",
        generalRating: 5,
        serviceQualityRating: 5,
        punctualityRating: 5,
        communicationRating: 5,
        clientId: 2,
        reservationId: 2,
        createdAt: '2026-02-20T18:00:00Z'
      },
      {
        id: 3,
        comment: "Magnifique résultat pour la peinture de notre chambre ! Ligne de démarcation parfaite, zéro projection et finition satinée très élégante.",
        generalRating: 5,
        serviceQualityRating: 5,
        punctualityRating: 4,
        communicationRating: 5,
        clientId: 2,
        reservationId: 3,
        createdAt: '2026-02-25T14:30:00Z'
      }
    ];
  }
}
