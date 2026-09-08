import { Component, OnInit } from '@angular/core';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AdminSidebarComponent } from '../admin-sidebar/admin-sidebar.component';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule, 
    AdminSidebarComponent,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule
  ],
  templateUrl: './admin-layout.component.html',
  styleUrls: ['./admin-layout.component.css']
})
export class AdminLayoutComponent implements OnInit {
  pageTitle: string = 'Tableau de Bord';
  breadcrumbPath: string = 'Aperçu / Vue d\'ensemble';

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.updateBreadcrumbs(this.router.url);
    this.router.events.pipe(
      filter(e => e instanceof NavigationEnd)
    ).subscribe((event: any) => {
      this.updateBreadcrumbs(event.urlAfterRedirects || event.url);
    });
  }

  updateBreadcrumbs(url: string): void {
    if (url.includes('/admin/evaluation-stats')) {
      this.pageTitle = 'Observatoire Qualité & Satisfaction';
      this.breadcrumbPath = 'Satisfaction & Qualité / Statistiques et Indicateurs Métier';
    } else if (url.includes('/admin/evaluations')) {
      this.pageTitle = 'Modération des Avis Clients';
      this.breadcrumbPath = 'Satisfaction & Qualité / Registre et Évaluations';
    } else if (url.includes('/admin/reservations')) {
      this.pageTitle = 'Supervision & Dispatching des Chantiers';
      this.breadcrumbPath = 'Opérations / Interventions et Affectations Artisans';
    } else if (url.includes('/admin/employees')) {
      this.pageTitle = 'Annuaire des Artisans Certifiés';
      this.breadcrumbPath = 'Réseau / Professionnels et Agréments Décennale';
    } else if (url.includes('/admin/invoices/dashboard')) {
      this.pageTitle = 'Cockpit Financier & Séquestre';
      this.breadcrumbPath = 'Finances / Métriques et Recouvrement Stripe';
    } else if (url.includes('/admin/invoices')) {
      this.pageTitle = 'Grand Livre des Factures';
      this.breadcrumbPath = 'Finances / Facturation et Règlements';
    } else if (url.includes('/admin/services-tasks')) {
      this.pageTitle = 'Arborescence des Services & Tâches';
      this.breadcrumbPath = 'Catalogue / Métiers et Opérations Standardisées';
    } else if (url.includes('/admin/services')) {
      this.pageTitle = 'Référentiel des Prestations';
      this.breadcrumbPath = 'Catalogue / Nomenclature et Barèmes';
    } else if (url.includes('/admin/tasks-management') || url.includes('/admin/tasks')) {
      this.pageTitle = 'Pilotage du Catalogue des Tâches';
      this.breadcrumbPath = 'Catalogue / Gestion des Tâches et Matériaux';
    } else {
      this.pageTitle = 'Tableau de Bord Administrateur';
      this.breadcrumbPath = 'Aperçu / Cockpit Exécutif et Supervision';
    }
  }
}
