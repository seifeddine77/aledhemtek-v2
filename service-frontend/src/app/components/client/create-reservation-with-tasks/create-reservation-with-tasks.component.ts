import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatStepperModule } from '@angular/material/stepper';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatDividerModule } from '@angular/material/divider';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { ReservationService } from '../../../services/reservation.service';
import { AuthService } from '../../../services/auth.service';
import { GeolocationService, CustomGeolocationPosition } from '../../../services/geolocation.service';
import { TaskSelectorComponent, SelectedTask } from '../task-selector/task-selector.component';
import { LocationMapComponent } from '../../shared/location-map/location-map.component';
import { Reservation, ReservationStatus } from '../../../models/reservation.model';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-create-reservation-with-tasks',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatStepperModule,
    MatProgressBarModule,
    MatDividerModule,
    MatCheckboxModule,
    TaskSelectorComponent,
    LocationMapComponent
  ],
  templateUrl: './create-reservation-with-tasks.component.html',
  styleUrls: ['./create-reservation-with-tasks.component.css']
})
export class CreateReservationWithTasksComponent implements OnInit {
  
  // Formulaires pour les étapes
  reservationInfoForm!: FormGroup;
  taskSelectionForm!: FormGroup;
  confirmationForm!: FormGroup;

  // État du composant
  loading = false;
  minDate = new Date();
  selectedTasks: SelectedTask[] = [];
  totalPrice = 0;
  totalDuration = 0;
  currentUser: any;
  
  // Géolocalisation
  geolocationLoading = false;
  currentPosition: CustomGeolocationPosition | null = null;
  geolocationSupported = false;

  constructor(
    private fb: FormBuilder,
    private reservationService: ReservationService,
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar,
    private cdr: ChangeDetectorRef,
    private http: HttpClient,
    private geolocationService: GeolocationService
  ) {
    this.initializeForms();
  }

  ngOnInit(): void {
    this.loadCurrentUser();
    // Vérifier si la géolocalisation est supportée
    this.geolocationSupported = this.geolocationService.isGeolocationAvailable();
  }

  private loadCurrentUser(): void {
    // Récupérer l'utilisateur actuellement connecté
    const userId = this.authService.getCurrentUserId();
    const userRole = this.authService.getRole();
    
    if (userId && userRole === 'client') {
      // Charger les informations du client connecté depuis le backend
      this.http.get<any>(`http://localhost:8080/api/clients/${userId}`).subscribe({
        next: (client: any) => {
          this.currentUser = {
            id: client.id,
            name: `${client.firstName} ${client.lastName}`,
            email: client.email,
            role: 'CLIENT'
          };
          console.log('Client connecté chargé:', this.currentUser);
        },
        error: (error: any) => {
          console.error('Erreur lors du chargement du client connecté:', error);
          // Fallback avec l'ID du localStorage
          this.currentUser = {
            id: userId,
            name: 'Client',
            email: '',
            role: 'CLIENT'
          };
        }
      });
    } else {
      console.error('Aucun utilisateur connecté ou rôle incorrect');
      this.router.navigate(['/login']);
    }
  }

  private initializeForms(): void {
    // Étape 1: Informations de base de la réservation
    this.reservationInfoForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      description: [''],
      startDate: ['', Validators.required],
      startTime: ['', Validators.required],
      endDate: [''],
      endTime: ['']
    });

    // Étape 2: Sélection des tâches
    this.taskSelectionForm = this.fb.group({
      tasksSelected: [false, Validators.requiredTrue]
    });

    // Étape 3: Confirmation
    this.confirmationForm = this.fb.group({
      termsAccepted: [false, Validators.requiredTrue],
      notes: ['']
    });
  }

  onTasksSelected(selectedTasks: SelectedTask[]): void {
    this.selectedTasks = selectedTasks;
    this.taskSelectionForm.patchValue({
      tasksSelected: selectedTasks.length > 0
    });
  }

  onTotalPriceChanged(newPrice: any): void {
    console.log('Prix reçu du sélecteur:', newPrice, 'Type:', typeof newPrice);
    
    // S'assurer que le prix est un nombre
    if (typeof newPrice === 'number' && !isNaN(newPrice)) {
      this.totalPrice = newPrice;
    } else if (typeof newPrice === 'object' && newPrice !== null && newPrice.totalPrice !== undefined) {
      this.totalPrice = Number(newPrice.totalPrice);
    } else {
      console.error('Prix invalide reçu:', newPrice);
      this.totalPrice = 0;
    }
    
    console.log('Prix total mis à jour:', this.totalPrice);
    
    // Recalculer la durée totale quand le prix change
    this.calculateTotalDuration();
    // Mettre à jour les dates de fin automatiquement
    this.updateEndDateTime();
    this.cdr.detectChanges();
  }

  calculateTotalDuration(): void {
    this.totalDuration = this.selectedTasks.reduce((total, selectedTask) => {
      return total + (selectedTask.task.duration * selectedTask.quantity);
    }, 0);
  }

  updateEndDateTime(): void {
    const startDate = this.reservationInfoForm.get('startDate')?.value;
    const startTime = this.reservationInfoForm.get('startTime')?.value;
    
    if (startDate && startTime && this.totalDuration > 0) {
      const startDateTime = new Date(startDate);
      const [hours, minutes] = startTime.split(':');
      startDateTime.setHours(parseInt(hours), parseInt(minutes));
      
      // Ajouter la durée totale
      const endDateTime = new Date(startDateTime.getTime() + this.totalDuration * 60000);
      
      this.reservationInfoForm.patchValue({
        endDate: endDateTime.toISOString().split('T')[0],
        endTime: endDateTime.toTimeString().slice(0, 5)
      });
    }
  }

  onStepChange(event: any): void {
    if (event.selectedIndex === 1) {
      // Entré dans l'étape de sélection des tâches
      this.calculateTotalDuration();
    } else if (event.selectedIndex === 2) {
      // Entré dans l'étape de confirmation
      this.updateEndDateTime();
    }
  }

  createReservation(): void {
    if (!this.isFormValid()) {
      this.snackBar.open('Veuillez remplir tous les champs requis', 'Fermer', {
        duration: 3000,
        panelClass: ['error-snackbar']
      });
      return;
    }

    this.loading = true;

    const reservationData = this.buildReservationData();

    this.reservationService.createReservationPublic(reservationData).subscribe({
      next: (response) => {
        this.snackBar.open('Réservation créée avec succès!', 'Fermer', {
          duration: 3000,
          panelClass: ['success-snackbar']
        });
        this.router.navigate(['/client/reservations']);
      },
      error: (error) => {
        console.error('Erreur lors de la création de la réservation:', error);
        
        // Extraire le message d'erreur du backend
        let errorMessage = 'Erreur lors de la création de la réservation';
        if (error.error && typeof error.error === 'string') {
          errorMessage = error.error;
        } else if (error.message) {
          errorMessage = error.message;
        }
        
        this.snackBar.open(errorMessage, 'Fermer', {
          duration: 5000, // Plus long pour lire le message
          panelClass: ['error-snackbar']
        });
        this.loading = false;
      }
    });
  }

  private buildReservationData(): any {
    const formData = this.reservationInfoForm.value;
    const confirmationData = this.confirmationForm.value;

    // Construire les dates complètes
    const startDateTime = this.buildDateTime(formData.startDate, formData.startTime);
    const endDateTime = this.buildDateTime(formData.endDate, formData.endTime);

    // Construire les IDs des tâches sélectionnées pour la réservation
    const taskIds = this.selectedTasks.map(selectedTask => selectedTask.task.id);

    return {
      title: formData.title,
      description: formData.description,
      startDate: startDateTime,
      endDate: endDateTime,
      status: ReservationStatus.PENDING,
      assigned: false,
      clientId: this.currentUser?.id,
      taskIds: taskIds,
      notes: confirmationData.notes,
      // Ajouter les données de géolocalisation si disponibles
      latitude: this.currentPosition?.latitude,
      longitude: this.currentPosition?.longitude,
      address: this.currentPosition?.address
    };
  }

  private buildDateTime(date: string, time: string): string {
    const dateObj = new Date(date);
    const [hours, minutes] = time.split(':');
    dateObj.setHours(parseInt(hours), parseInt(minutes));
    return dateObj.toISOString();
  }

  private isFormValid(): boolean {
    return this.reservationInfoForm.valid && 
           this.taskSelectionForm.valid && 
           this.confirmationForm.valid &&
           this.selectedTasks.length > 0;
  }

  getSelectedTasksCount(): number {
    return this.selectedTasks.length;
  }

  getEstimatedDuration(): string {
    const hours = Math.floor(this.totalDuration / 60);
    const minutes = this.totalDuration % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}min`;
    }
    return `${minutes}min`;
  }

  formatPrice(price: any): string {
    // Gérer les différents types de prix
    let numericPrice: number;
    
    if (typeof price === 'number' && !isNaN(price)) {
      numericPrice = price;
    } else if (typeof price === 'object' && price !== null && price.totalPrice !== undefined) {
      numericPrice = Number(price.totalPrice);
    } else if (typeof price === 'string') {
      numericPrice = parseFloat(price);
    } else {
      console.error('Format de prix non reconnu:', price, 'Type:', typeof price);
      return 'Prix non disponible';
    }
    
    if (isNaN(numericPrice)) {
      return 'Prix non disponible';
    }
    
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(numericPrice);
  }

  resetForm(): void {
    this.reservationInfoForm.reset();
    this.taskSelectionForm.reset();
    this.confirmationForm.reset();
    this.selectedTasks = [];
    this.totalPrice = 0;
    this.totalDuration = 0;
    this.currentPosition = null;
  }

  /**
   * Obtenir la position actuelle de l'utilisateur
   */
  getCurrentLocation(): void {
    if (!this.geolocationSupported) {
      this.snackBar.open('La géolocalisation n\'est pas supportée par votre navigateur', 'Fermer', { duration: 3000 });
      return;
    }

    this.geolocationLoading = true;
    
    this.geolocationService.getCurrentPosition().subscribe({
      next: (position) => {
        this.currentPosition = position;
        
        // Obtenir l'adresse à partir des coordonnées
        this.geolocationService.getAddressFromCoordinates(position.latitude, position.longitude)
          .subscribe({
            next: (address) => {
              if (this.currentPosition) {
                this.currentPosition.address = address;
              }
              this.snackBar.open('Position obtenue avec succès', 'Fermer', { duration: 3000 });
            },
            error: (error) => {
              console.warn('Erreur lors de l\'obtention de l\'adresse:', error);
              this.snackBar.open('Position obtenue (adresse non disponible)', 'Fermer', { duration: 3000 });
            }
          });
        
        this.geolocationLoading = false;
      },
      error: (error) => {
        console.error('Erreur de géolocalisation:', error);
        this.snackBar.open(`Erreur: ${error.message}`, 'Fermer', { duration: 5000 });
        this.geolocationLoading = false;
      }
    });
  }

  /**
   * Effacer la position actuelle
   */
  clearLocation(): void {
    this.currentPosition = null;
    this.snackBar.open('Position effacée', 'Fermer', { duration: 2000 });
  }

  /**
   * Formater les coordonnées pour l'affichage
   */
  formatCoordinates(): string {
    if (!this.currentPosition) return '';
    return `${this.currentPosition.latitude.toFixed(6)}, ${this.currentPosition.longitude.toFixed(6)}`;
  }




}
