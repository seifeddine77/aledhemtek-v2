import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatBadgeModule } from '@angular/material/badge';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-consultant-sidebar',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    RouterLinkActive,
    MatIconModule,
    MatTooltipModule,
    MatBadgeModule
  ],
  templateUrl: './consultant-sidebar.component.html',
  styleUrls: ['./consultant-sidebar.component.css']
})
export class ConsultantSidebarComponent implements OnInit {
  artisanName = 'Artisan Partenaire';
  artisanEmail = 'consultant@test.com';
  artisanInitials = 'AP';
  availabilityStatus: 'AVAILABLE' | 'ON_MISSION' | 'OFFLINE' = 'AVAILABLE';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.extractArtisanInfo();
  }

  extractArtisanInfo(): void {
    try {
      const token = localStorage.getItem('jwt');
      if (token) {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const email = payload.sub || '';
        if (email) {
          this.artisanEmail = email;
          const raw = email.split('@')[0];
          this.artisanName = raw.charAt(0).toUpperCase() + raw.slice(1);
          this.artisanInitials = this.artisanName.slice(0, 2).toUpperCase();
        }
      }
    } catch (e) {
      this.artisanName = 'Artisan Pro';
    }
  }

  setAvailability(status: 'AVAILABLE' | 'ON_MISSION' | 'OFFLINE'): void {
    this.availabilityStatus = status;
  }

  logout(): void {
    this.authService.logout();
  }
}
