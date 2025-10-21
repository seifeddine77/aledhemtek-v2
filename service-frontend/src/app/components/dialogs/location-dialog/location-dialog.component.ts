import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { LocationMapComponent } from '../../shared/location-map/location-map.component';
import { Reservation } from '../../../models/reservation.model';
import { CustomGeolocationPosition } from '../../../services/geolocation.service';

export interface LocationDialogData {
  reservation: Reservation;
}

@Component({
  selector: 'app-location-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
    LocationMapComponent
  ],
  templateUrl: './location-dialog.component.html',
  styleUrls: ['./location-dialog.component.css']
})
export class LocationDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<LocationDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: LocationDialogData,
    private snackBar: MatSnackBar
  ) {}

  getPosition(): CustomGeolocationPosition | null {
    const lat = this.data.reservation.latitude;
    const lng = this.data.reservation.longitude;
    if (lat && lng) {
      return {
        latitude: lat,
        longitude: lng,
        accuracy: 10, // Valeur par défaut
        address: this.data.reservation.address || undefined
      };
    }
    return null;
  }

  formatCoordinates(): string {
    const lat = this.data.reservation.latitude;
    const lng = this.data.reservation.longitude;
    if (lat && lng) {
      return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
    }
    return '';
  }

  openInMaps(): void {
    const lat = this.data.reservation.latitude;
    const lng = this.data.reservation.longitude;
    if (lat && lng) {
      const url = `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}&zoom=15`;
      window.open(url, '_blank');
    }
  }

  copyCoordinates(): void {
    const coordinates = this.formatCoordinates();
    if (coordinates) {
      navigator.clipboard.writeText(coordinates).then(() => {
        this.snackBar.open('Coordonnées copiées dans le presse-papiers', 'Fermer', {
          duration: 3000
        });
      }).catch(err => {
        console.error('Erreur lors de la copie:', err);
        this.snackBar.open('Erreur lors de la copie des coordonnées', 'Fermer', {
          duration: 3000
        });
      });
    }
  }
}
