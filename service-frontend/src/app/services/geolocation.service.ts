import { Injectable } from '@angular/core';
import { Observable, from, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

export interface CustomGeolocationPosition {
  latitude: number;
  longitude: number;
  accuracy: number;
  address?: string;
}

export interface GeolocationError {
  code: number;
  message: string;
}

@Injectable({
  providedIn: 'root'
})
export class GeolocationService {

  constructor() { }

  /**
   * Obtenir la position actuelle de l'utilisateur
   */
  getCurrentPosition(): Observable<CustomGeolocationPosition> {
    if (!navigator.geolocation) {
      return throwError(() => ({
        code: 0,
        message: 'La géolocalisation n\'est pas supportée par ce navigateur'
      }));
    }

    const options: PositionOptions = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 300000 // 5 minutes
    };

    return from(
      new Promise<CustomGeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          (position: GeolocationPosition) => {
            const result: CustomGeolocationPosition = {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              accuracy: position.coords.accuracy
            };
            resolve(result);
          },
          (error: GeolocationPositionError) => {
            const geoError: GeolocationError = {
              code: error.code,
              message: this.getErrorMessage(error.code)
            };
            reject(geoError);
          },
          options
        );
      })
    );
  }

  /**
   * Obtenir l'adresse à partir des coordonnées (géocodage inverse)
   */
  getAddressFromCoordinates(latitude: number, longitude: number): Observable<string> {
    // Utilisation de l'API de géocodage inverse de Nominatim (OpenStreetMap)
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`;
    
    return from(
      fetch(url)
        .then(response => response.json())
        .then(data => {
          if (data && data.display_name) {
            return data.display_name;
          } else {
            return `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
          }
        })
        .catch(() => {
          return `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
        })
    );
  }

  /**
   * Obtenir la position avec l'adresse
   */
  getCurrentPositionWithAddress(): Observable<CustomGeolocationPosition> {
    return this.getCurrentPosition().pipe(
      map(position => {
        // Obtenir l'adresse en parallèle
        this.getAddressFromCoordinates(position.latitude, position.longitude)
          .subscribe(address => {
            position.address = address;
          });
        return position;
      }),
      catchError(error => throwError(() => error))
    );
  }

  /**
   * Vérifier si la géolocalisation est disponible
   */
  isGeolocationAvailable(): boolean {
    return 'geolocation' in navigator;
  }

  /**
   * Obtenir le message d'erreur selon le code
   */
  private getErrorMessage(code: number): string {
    switch (code) {
      case 1:
        return 'Permission refusée pour accéder à la géolocalisation';
      case 2:
        return 'Position non disponible';
      case 3:
        return 'Délai d\'attente dépassé pour obtenir la position';
      default:
        return 'Erreur inconnue lors de la géolocalisation';
    }
  }

  /**
   * Calculer la distance entre deux points (en kilomètres)
   */
  calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Rayon de la Terre en kilomètres
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c;
    return Math.round(distance * 100) / 100; // Arrondir à 2 décimales
  }

  private deg2rad(deg: number): number {
    return deg * (Math.PI/180);
  }
}
