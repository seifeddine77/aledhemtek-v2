import { Component, Input, OnInit, OnDestroy, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { CustomGeolocationPosition } from '../../../services/geolocation.service';
import { MapService, MapOptions } from '../../../services/map.service';

// Déclaration pour Leaflet global
declare var L: any;

@Component({
  selector: 'app-location-map',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule
  ],
  template: `
    <div class="location-map-container">
      <div class="map-header" *ngIf="showHeader">
        <h4>
          <mat-icon>place</mat-icon>
          {{ title }}
        </h4>
        <div class="map-actions" *ngIf="showActions">
          <button mat-icon-button 
                  (click)="openInNewTab()" 
                  matTooltip="Ouvrir dans OpenStreetMap">
            <mat-icon>open_in_new</mat-icon>
          </button>
          <button mat-icon-button 
                  (click)="centerMap()" 
                  matTooltip="Centrer la carte">
            <mat-icon>my_location</mat-icon>
          </button>
        </div>
      </div>
      
      <div class="map-wrapper">
        <div #mapContainer 
             class="map-container" 
             [style.height]="height"
             [style.width]="width">
        </div>
        
        <!-- Fallback si Leaflet n'est pas disponible -->
        <div class="map-fallback" *ngIf="!mapLoaded">
          <mat-icon>map</mat-icon>
          <p>Chargement de la carte...</p>
          <small *ngIf="position">
            📍 {{ position.latitude.toFixed(6) }}, {{ position.longitude.toFixed(6) }}
          </small>
        </div>
      </div>
      
      <!-- Informations sur la position -->
      <div class="position-info" *ngIf="showInfo && position">
        <div class="info-item">
          <mat-icon>place</mat-icon>
          <span>{{ position.latitude.toFixed(6) }}, {{ position.longitude.toFixed(6) }}</span>
        </div>
        <div class="info-item" *ngIf="position.address">
          <mat-icon>location_on</mat-icon>
          <span>{{ position.address }}</span>
        </div>
        <div class="info-item">
          <mat-icon>gps_fixed</mat-icon>
          <span>Précision: ±{{ position.accuracy }}m</span>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .location-map-container {
      width: 100%;
      border: 1px solid #e0e0e0;
      border-radius: 8px;
      overflow: hidden;
      background: white;
    }

    .map-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 16px;
      background: #f5f5f5;
      border-bottom: 1px solid #e0e0e0;
    }

    .map-header h4 {
      display: flex;
      align-items: center;
      gap: 8px;
      margin: 0;
      color: #333;
      font-size: 1rem;
      font-weight: 500;
    }

    .map-actions {
      display: flex;
      gap: 4px;
    }

    .map-wrapper {
      position: relative;
    }

    .map-container {
      min-height: 200px;
      background: #f0f0f0;
    }

    .map-fallback {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 200px;
      color: #666;
      text-align: center;
      padding: 20px;
    }

    .map-fallback mat-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      margin-bottom: 12px;
      color: #999;
    }

    .position-info {
      padding: 12px 16px;
      background: #fafafa;
      border-top: 1px solid #e0e0e0;
    }

    .info-item {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 8px;
      font-size: 0.9rem;
      color: #666;
    }

    .info-item:last-child {
      margin-bottom: 0;
    }

    .info-item mat-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
      color: #4caf50;
    }

    /* Responsive */
    @media (max-width: 768px) {
      .map-header {
        flex-direction: column;
        gap: 8px;
        align-items: flex-start;
      }
      
      .map-actions {
        align-self: flex-end;
      }
    }
  `]
})
export class LocationMapComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('mapContainer', { static: false }) mapContainer!: ElementRef;

  @Input() position: CustomGeolocationPosition | null = null;
  @Input() title: string = 'Localisation';
  @Input() height: string = '300px';
  @Input() width: string = '100%';
  @Input() showHeader: boolean = true;
  @Input() showActions: boolean = true;
  @Input() showInfo: boolean = true;
  @Input() readonly: boolean = false;
  @Input() mapOptions: MapOptions = {};

  private map: any = null;
  private marker: any = null;
  private accuracyCircle: any = null;
  mapLoaded = false;

  constructor(private mapService: MapService) {}

  ngOnInit(): void {
    // Charger Leaflet dynamiquement
    this.loadLeaflet();
  }

  ngAfterViewInit(): void {
    if (this.position && this.mapLoaded) {
      this.initializeMap();
    }
  }

  ngOnDestroy(): void {
    if (this.map) {
      this.map.remove();
    }
  }

  private loadLeaflet(): void {
    // Vérifier si Leaflet est déjà chargé
    if (typeof L !== 'undefined') {
      this.mapLoaded = true;
      return;
    }

    // Charger les styles CSS de Leaflet
    if (!document.querySelector('link[href*="leaflet.css"]')) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);
    }

    // Charger le script JavaScript de Leaflet
    if (!document.querySelector('script[src*="leaflet.js"]')) {
      const script = document.createElement('script');
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      script.onload = () => {
        this.mapLoaded = true;
        if (this.position && this.mapContainer) {
          this.initializeMap();
        }
      };
      document.head.appendChild(script);
    }
  }

  private initializeMap(): void {
    if (!this.position || !this.mapContainer || !this.mapLoaded) return;

    const containerId = `map-${Math.random().toString(36).substr(2, 9)}`;
    this.mapContainer.nativeElement.id = containerId;

    if (this.readonly) {
      this.map = this.mapService.createReadOnlyMap(containerId, this.position, this.mapOptions);
    } else {
      this.map = this.mapService.createMap(containerId, {
        center: [this.position.latitude, this.position.longitude],
        zoom: 15,
        ...this.mapOptions
      });

      if (this.map) {
        this.marker = this.mapService.addMarker(this.map, this.position);
        this.accuracyCircle = this.mapService.addAccuracyCircle(this.map, this.position);
      }
    }
  }

  centerMap(): void {
    if (this.map && this.position) {
      this.mapService.centerMap(this.map, this.position);
    }
  }

  openInNewTab(): void {
    if (this.position) {
      const url = `https://www.openstreetmap.org/?mlat=${this.position.latitude}&mlon=${this.position.longitude}&zoom=15`;
      window.open(url, '_blank');
    }
  }

  updatePosition(newPosition: CustomGeolocationPosition): void {
    this.position = newPosition;
    
    if (this.map) {
      // Supprimer les anciens marqueurs
      this.mapService.clearMap(this.map);
      
      // Ajouter les nouveaux
      this.marker = this.mapService.addMarker(this.map, this.position);
      this.accuracyCircle = this.mapService.addAccuracyCircle(this.map, this.position);
      
      // Centrer la carte
      this.centerMap();
    } else if (this.mapLoaded) {
      // Initialiser la carte si elle n'existe pas encore
      this.initializeMap();
    }
  }
}
