import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatTabsModule } from '@angular/material/tabs';
import { Reservation } from '../../../models/reservation.model';
import { LocationMapComponent } from '../../shared/location-map/location-map.component';

export interface ClientReservationDetailsDialogData {
  reservation: Reservation;
}

@Component({
  selector: 'app-client-reservation-details-dialog',
  templateUrl: './client-reservation-details-dialog.component.html',
  styleUrl: './client-reservation-details-dialog.component.css',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatChipsModule,
    MatDividerModule,
    MatTabsModule,
    LocationMapComponent
  ]
})
export class ClientReservationDetailsDialogComponent {
  showMap = false;

  constructor(
    public dialogRef: MatDialogRef<ClientReservationDetailsDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ClientReservationDetailsDialogData
  ) {}

  hasTasks(): boolean {
    return !!(this.data.reservation.tasks && this.data.reservation.tasks.length > 0);
  }

  hasLocation(): boolean {
    return !!(this.data.reservation.latitude && this.data.reservation.longitude);
  }

  hasConsultant(): boolean {
    return !!(this.data.reservation.consultantName && this.data.reservation.consultantName !== 'Non assigné');
  }

  getLocationPosition() {
    if (!this.hasLocation()) return null;
    return {
      latitude: this.data.reservation.latitude!,
      longitude: this.data.reservation.longitude!,
      address: this.data.reservation.address,
      accuracy: 10
    };
  }

  formatDateTime(dateTime: string | Date): string {
    const date = new Date(dateTime);
    return date.toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(price);
  }

  getStatusColor(status: string): string {
    switch (status?.toUpperCase()) {
      case 'PENDING': return '#ff9800';
      case 'ASSIGNED': return '#2196f3';
      case 'IN_PROGRESS': return '#4caf50';
      case 'COMPLETED': return '#8bc34a';
      case 'CANCELLED': return '#f44336';
      default: return '#9e9e9e';
    }
  }

  getStatusText(status: string): string {
    switch (status?.toUpperCase()) {
      case 'PENDING': return 'En attente d\'assignation';
      case 'ASSIGNED': return 'Consultant assigné';
      case 'IN_PROGRESS': return 'Intervention en cours';
      case 'COMPLETED': return 'Intervention terminée';
      case 'CANCELLED': return 'Annulée';
      default: return status;
    }
  }

  getStatusDescription(status: string): string {
    switch (status?.toUpperCase()) {
      case 'PENDING': return 'Votre demande est en cours de traitement. Un consultant vous sera assigné prochainement.';
      case 'ASSIGNED': return 'Un consultant a été assigné à votre demande. Il vous contactera bientôt.';
      case 'IN_PROGRESS': return 'Le consultant est actuellement en train de réaliser l\'intervention.';
      case 'COMPLETED': return 'L\'intervention a été terminée avec succès.';
      case 'CANCELLED': return 'Cette réservation a été annulée.';
      default: return '';
    }
  }

  getTotalTasksPrice(): number {
    // Pour l'instant, retourner le prix total de la réservation s'il est disponible
    return this.data.reservation.totalPrice || 0;
  }

  openInMaps(): void {
    if (this.hasLocation()) {
      const url = `https://www.openstreetmap.org/?mlat=${this.data.reservation.latitude}&mlon=${this.data.reservation.longitude}&zoom=16`;
      window.open(url, '_blank');
    }
  }

  copyCoordinates(): void {
    if (this.hasLocation()) {
      const coords = `${this.data.reservation.latitude}, ${this.data.reservation.longitude}`;
      navigator.clipboard.writeText(coords).then(() => {
        console.log('Coordonnées copiées:', coords);
      });
    }
  }
}
