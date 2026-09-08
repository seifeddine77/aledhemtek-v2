import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatBadgeModule } from '@angular/material/badge';
import { MatDividerModule } from '@angular/material/divider';
import { AuthService } from '../../../services/auth.service';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-client-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatTooltipModule,
    MatBadgeModule,
    MatDividerModule
  ],
  templateUrl: './client-layout.component.html',
  styleUrls: ['./client-layout.component.css']
})
export class ClientLayoutComponent implements OnInit {
  userName = 'Client AledhemTek';
  userEmail = 'client@test.com';
  userInitials = 'CL';
  currentPageTitle = 'Tableau de bord';
  mobileMenuOpen = false;

  constructor(
    public authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.extractUserInfo();
    this.updatePageTitle(this.router.url);

    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      this.updatePageTitle(event.urlAfterRedirects || event.url);
      this.mobileMenuOpen = false;
    });
  }

  extractUserInfo(): void {
    try {
      const token = localStorage.getItem('jwt');
      if (token) {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const email = payload.sub || '';
        if (email) {
          this.userEmail = email;
          const rawName = email.split('@')[0];
          this.userName = rawName.charAt(0).toUpperCase() + rawName.slice(1);
          this.userInitials = this.userName.slice(0, 2).toUpperCase();
        }
      }
    } catch (e) {
      console.warn('Could not decode token for user name', e);
    }
  }

  updatePageTitle(url: string): void {
    if (url.includes('/client/dashboard')) {
      this.currentPageTitle = 'Tableau de bord';
    } else if (url.includes('/client/reservations')) {
      this.currentPageTitle = 'Mes Réservations & Suivi';
    } else if (url.includes('/client/create-reservation')) {
      this.currentPageTitle = 'Nouvelle Demande d\'Intervention';
    } else if (url.includes('/client/invoices')) {
      this.currentPageTitle = 'Factures & Règlements';
    } else if (url.includes('/client/evaluations')) {
      this.currentPageTitle = 'Mes Évaluations & Avis';
    } else {
      this.currentPageTitle = 'Portail Client';
    }
  }

  toggleMobileMenu(): void {
    this.mobileMenuOpen = !this.mobileMenuOpen;
  }

  logout(): void {
    this.authService.logout();
  }
}
