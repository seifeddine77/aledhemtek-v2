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

export interface ReservationDetailsDialogData {
  reservation: Reservation;
}

@Component({
  selector: 'app-reservation-details-dialog',
  templateUrl: './reservation-details-dialog.component.html',
  styleUrls: ['./reservation-details-dialog.component.css'],
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
export class ReservationDetailsDialogComponent {
  showMap = false;

  constructor(
    public dialogRef: MatDialogRef<ReservationDetailsDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ReservationDetailsDialogData
  ) {}

  hasTasks(): boolean {
    return !!(this.data.reservation.tasks && this.data.reservation.tasks.length > 0);
  }

  hasLocation(): boolean {
    return !!(this.data.reservation.latitude && this.data.reservation.longitude);
  }

  getLocationPosition() {
    if (!this.hasLocation()) return null;
    return {
      latitude: this.data.reservation.latitude!,
      longitude: this.data.reservation.longitude!,
      address: this.data.reservation.address,
      accuracy: 10 // Valeur par défaut
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
      case 'PENDING': return 'En attente';
      case 'ASSIGNED': return 'Assignée';
      case 'IN_PROGRESS': return 'En cours';
      case 'COMPLETED': return 'Terminée';
      case 'CANCELLED': return 'Annulée';
      default: return status;
    }
  }

  copyCoordinates(): void {
    if (this.hasLocation()) {
      const coords = `${this.data.reservation.latitude}, ${this.data.reservation.longitude}`;
      navigator.clipboard.writeText(coords).then(() => {
        // Feedback utilisateur (peut être amélioré avec un snackbar)
        console.log('Coordonnées copiées:', coords);
      });
    }
  }

  openInMaps(): void {
    if (this.hasLocation()) {
      const url = `https://www.openstreetmap.org/?mlat=${this.data.reservation.latitude}&mlon=${this.data.reservation.longitude}&zoom=16`;
      window.open(url, '_blank');
    }
  }

  shareLocation(): void {
    if (this.hasLocation() && navigator.share) {
      navigator.share({
        title: 'Localisation de l\'intervention',
        text: `Intervention: ${this.data.reservation.title}`,
        url: `https://www.openstreetmap.org/?mlat=${this.data.reservation.latitude}&mlon=${this.data.reservation.longitude}&zoom=16`
      });
    }
  }

  /**
   * Formater un numéro de téléphone pour l'affichage
   */
  formatPhoneNumber(phone: string): string {
    if (!phone) return '';
    
    // Nettoyer le numéro
    const cleaned = phone.replace(/\D/g, '');
    
    // Format français : 06 12 34 56 78
    if (cleaned.length === 10 && cleaned.startsWith('0')) {
      return cleaned.replace(/(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})/, '$1 $2 $3 $4 $5');
    }
    
    // Format international : +33 6 12 34 56 78
    if (cleaned.length === 11 && cleaned.startsWith('33')) {
      return '+' + cleaned.replace(/(\d{2})(\d{1})(\d{2})(\d{2})(\d{2})(\d{2})/, '$1 $2 $3 $4 $5 $6');
    }
    
    // Retourner tel quel si format non reconnu
    return phone;
  }

  /**
   * Appeler le client
   */
  contactClient(): void {
    const phone = this.data.reservation.clientPhone;
    if (!phone) {
      alert('Aucun numéro de téléphone disponible pour ce client.');
      return;
    }

    // Nettoyer le numéro pour l'appel
    const cleanPhone = phone.replace(/\D/g, '');
    
    // Créer l'URL tel: pour déclencher l'appel
    const telUrl = `tel:${cleanPhone}`;
    
    // Confirmation avant appel
    const confirmCall = confirm(
      `Voulez-vous appeler ${this.data.reservation.clientName} au ${this.formatPhoneNumber(phone)} ?`
    );
    
    if (confirmCall) {
      // Ouvrir l'application téléphone
      window.location.href = telUrl;
      
      // Log pour le suivi
      console.log(`Appel initié vers ${this.data.reservation.clientName} (${phone})`);
      
      // Optionnel : fermer le dialog après l'appel
      setTimeout(() => {
        // this.dialogRef.close({ action: 'call', phone: phone });
      }, 1000);
    }
  }

  /**
   * Envoyer un SMS au client
   */
  sendSMS(): void {
    const phone = this.data.reservation.clientPhone;
    if (!phone) {
      alert('Aucun numéro de téléphone disponible pour ce client.');
      return;
    }

    // Nettoyer le numéro
    const cleanPhone = phone.replace(/\D/g, '');
    
    // Message prédéfini
    const defaultMessage = encodeURIComponent(
      `Bonjour ${this.data.reservation.clientName}, concernant votre réservation "${this.data.reservation.title}" prévue le ${this.formatDateTime(this.data.reservation.startDate)}. Cordialement, votre consultant.`
    );
    
    // Créer l'URL SMS
    const smsUrl = `sms:${cleanPhone}?body=${defaultMessage}`;
    
    // Ouvrir l'application SMS
    window.location.href = smsUrl;
    
    // Log pour le suivi
    console.log(`SMS initié vers ${this.data.reservation.clientName} (${phone})`);
  }

  /**
   * Gérer le changement d'onglet
   */
  onTabChange(event: any): void {
    // Si l'onglet localisation (index 2) est sélectionné, afficher la carte
    if (event.index === 2 && this.hasLocation()) {
      // Délai pour s'assurer que le DOM est prêt
      setTimeout(() => {
        this.showMap = true;
      }, 100);
    }
  }
}
