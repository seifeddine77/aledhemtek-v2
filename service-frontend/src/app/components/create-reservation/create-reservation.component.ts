import { Component, OnInit } from '@angular/core';
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
import { ReservationService } from '../../services/reservation.service';
import { AuthService } from '../../services/auth.service';
import { GeolocationService, CustomGeolocationPosition } from '../../services/geolocation.service';
import { Reservation, ReservationStatus } from '../../models/reservation.model';

@Component({
  selector: 'app-create-reservation',
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
    MatStepperModule
  ],
  templateUrl: './create-reservation.component.html',
  styleUrls: ['./create-reservation.component.css']
})
export class CreateReservationComponent implements OnInit {
  reservationForm: FormGroup;
  loading = false;
  minDate = new Date();
  
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
    private geolocationService: GeolocationService
  ) {
    this.reservationForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      description: [''],
      startDate: ['', Validators.required],
      startTime: ['', Validators.required],
      endDate: ['', Validators.required],
      endTime: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    // Set default dates
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    this.reservationForm.patchValue({
      startDate: tomorrow,
      endDate: tomorrow,
      startTime: '09:00',
      endTime: '17:00'
    });
    
    // Vérifier si la géolocalisation est supportée
    this.geolocationSupported = this.geolocationService.isGeolocationAvailable();
  }

  onSubmit(): void {
    if (this.reservationForm.valid) {
      this.loading = true;
      
      const formValue = this.reservationForm.value;
      
      // Combine date and time
      const startDateTime = this.combineDateTime(formValue.startDate, formValue.startTime);
      const endDateTime = this.combineDateTime(formValue.endDate, formValue.endTime);
      
      // Validate that end time is after start time
      if (endDateTime <= startDateTime) {
        this.snackBar.open('La date de fin doit être après la date de début', 'Fermer', { duration: 3000 });
        this.loading = false;
        return;
      }
      
      const reservation: Reservation = {
        title: formValue.title,
        description: formValue.description,
        startDate: startDateTime.toISOString(),
        endDate: endDateTime.toISOString(),
        status: ReservationStatus.PENDING,
        clientId: this.authService.getCurrentUserId(),
        tasks: [], // Ajout de la liste de tâches vide
        // Ajouter les données de géolocalisation si disponibles
        latitude: this.currentPosition?.latitude,
        longitude: this.currentPosition?.longitude,
        address: this.currentPosition?.address
      };

      this.reservationService.createReservation(reservation).subscribe({
        next: (createdReservation) => {
          this.snackBar.open('Réservation créée avec succès', 'Fermer', { duration: 3000 });
          this.router.navigate(['/client/reservations']);
          this.loading = false;
        },
        error: (error) => {
          console.error('Error creating reservation:', error);
          this.snackBar.open('Erreur lors de la création de la réservation', 'Fermer', { duration: 3000 });
          this.loading = false;
        }
      });
    } else {
      this.markFormGroupTouched();
    }
  }

  private combineDateTime(date: Date, time: string): Date {
    const [hours, minutes] = time.split(':').map(Number);
    const combined = new Date(date);
    combined.setHours(hours, minutes, 0, 0);
    return combined;
  }

  private markFormGroupTouched(): void {
    Object.keys(this.reservationForm.controls).forEach(key => {
      const control = this.reservationForm.get(key);
      control?.markAsTouched();
    });
  }

  getErrorMessage(fieldName: string): string {
    const control = this.reservationForm.get(fieldName);
    if (control?.hasError('required')) {
      return `${fieldName} est requis`;
    }
    if (control?.hasError('minlength')) {
      return `${fieldName} doit contenir au moins ${control.errors?.['minlength'].requiredLength} caractères`;
    }
    return '';
  }

  onCancel(): void {
    this.router.navigate(['/client/dashboard']);
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
