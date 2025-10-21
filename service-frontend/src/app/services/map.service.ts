import { Injectable } from '@angular/core';
import { CustomGeolocationPosition } from './geolocation.service';

declare let L: any;

export interface MapOptions {
  center?: [number, number];
  zoom?: number;
  height?: string;
  width?: string;
}

@Injectable({
  providedIn: 'root'
})
export class MapService {
  private defaultCenter: [number, number] = [36.8065, 10.1815]; // Tunis, Tunisie
  private defaultZoom = 13;

  constructor() { }

  /**
   * Créer une carte Leaflet
   */
  createMap(containerId: string, options: MapOptions = {}): any {
    // Vérifier si Leaflet est chargé
    if (typeof L === 'undefined') {
      console.error('Leaflet n\'est pas chargé. Assurez-vous d\'inclure la bibliothèque Leaflet.');
      return null;
    }

    const map = L.map(containerId).setView(
      options.center || this.defaultCenter,
      options.zoom || this.defaultZoom
    );

    // Ajouter la couche de tuiles OpenStreetMap
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19
    }).addTo(map);

    return map;
  }

  /**
   * Ajouter un marqueur sur la carte
   */
  addMarker(map: any, position: CustomGeolocationPosition, options: any = {}): any {
    if (!map || !position) return null;

    const marker = L.marker([position.latitude, position.longitude], {
      title: options.title || 'Position',
      ...options
    }).addTo(map);

    // Ajouter un popup si une adresse est disponible
    if (position.address) {
      marker.bindPopup(`
        <div style="max-width: 200px;">
          <strong>📍 Position</strong><br>
          <small>${position.address}</small><br>
          <small>Précision: ±${position.accuracy}m</small>
        </div>
      `);
    }

    return marker;
  }

  /**
   * Centrer la carte sur une position
   */
  centerMap(map: any, position: CustomGeolocationPosition, zoom?: number): void {
    if (!map || !position) return;
    
    map.setView([position.latitude, position.longitude], zoom || this.defaultZoom);
  }

  /**
   * Ajouter un cercle de précision
   */
  addAccuracyCircle(map: any, position: CustomGeolocationPosition): any {
    if (!map || !position) return null;

    const circle = L.circle([position.latitude, position.longitude], {
      color: '#3388ff',
      fillColor: '#3388ff',
      fillOpacity: 0.1,
      radius: position.accuracy
    }).addTo(map);

    return circle;
  }

  /**
   * Supprimer tous les marqueurs et cercles
   */
  clearMap(map: any): void {
    if (!map) return;
    
    map.eachLayer((layer: any) => {
      if (layer instanceof L.Marker || layer instanceof L.Circle) {
        map.removeLayer(layer);
      }
    });
  }

  /**
   * Redimensionner la carte
   */
  resizeMap(map: any): void {
    if (!map) return;
    
    setTimeout(() => {
      map.invalidateSize();
    }, 100);
  }

  /**
   * Créer une carte en mode lecture seule pour affichage
   */
  createReadOnlyMap(containerId: string, position: CustomGeolocationPosition, options: MapOptions = {}): any {
    const map = this.createMap(containerId, {
      center: [position.latitude, position.longitude],
      zoom: options.zoom || 15,
      ...options
    });

    if (map) {
      // Désactiver les interactions
      map.dragging.disable();
      map.touchZoom.disable();
      map.doubleClickZoom.disable();
      map.scrollWheelZoom.disable();
      map.boxZoom.disable();
      map.keyboard.disable();
      if (map.tap) map.tap.disable();

      // Ajouter le marqueur
      this.addMarker(map, position, {
        title: 'Localisation de la réservation'
      });

      // Ajouter le cercle de précision
      this.addAccuracyCircle(map, position);
    }

    return map;
  }

  /**
   * Obtenir l'URL d'une image statique de la carte (alternative)
   */
  getStaticMapUrl(position: CustomGeolocationPosition, width = 400, height = 300, zoom = 15): string {
    // Utilisation de l'API StaticMap d'OpenStreetMap via MapBox ou similaire
    // Pour une version gratuite, on peut utiliser des services comme MapQuest
    const lat = position.latitude.toFixed(6);
    const lng = position.longitude.toFixed(6);
    
    // Exemple avec l'API de MapQuest (nécessite une clé API gratuite)
    // return `https://www.mapquestapi.com/staticmap/v5/map?key=YOUR_KEY&center=${lat},${lng}&size=${width},${height}&zoom=${zoom}&locations=${lat},${lng}`;
    
    // Alternative simple : lien vers OpenStreetMap
    return `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}&zoom=${zoom}`;
  }

  /**
   * Calculer la distance entre deux points et l'afficher sur la carte
   */
  addDistanceLine(map: any, from: CustomGeolocationPosition, to: CustomGeolocationPosition): any {
    if (!map || !from || !to) return null;

    const polyline = L.polyline([
      [from.latitude, from.longitude],
      [to.latitude, to.longitude]
    ], {
      color: '#ff7800',
      weight: 3,
      opacity: 0.8
    }).addTo(map);

    // Calculer la distance
    const distance = this.calculateDistance(from, to);
    
    // Ajouter un popup avec la distance
    const midPoint = [
      (from.latitude + to.latitude) / 2,
      (from.longitude + to.longitude) / 2
    ];
    
    L.popup()
      .setLatLng(midPoint)
      .setContent(`Distance: ${distance.toFixed(2)} km`)
      .openOn(map);

    return polyline;
  }

  /**
   * Calculer la distance entre deux points (en kilomètres)
   */
  private calculateDistance(from: CustomGeolocationPosition, to: CustomGeolocationPosition): number {
    const R = 6371; // Rayon de la Terre en kilomètres
    const dLat = this.deg2rad(to.latitude - from.latitude);
    const dLon = this.deg2rad(to.longitude - from.longitude);
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(this.deg2rad(from.latitude)) * Math.cos(this.deg2rad(to.latitude)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  private deg2rad(deg: number): number {
    return deg * (Math.PI/180);
  }
}
