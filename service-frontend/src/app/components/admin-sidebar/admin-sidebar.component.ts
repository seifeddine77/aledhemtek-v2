import { Component, HostBinding, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatBadgeModule } from '@angular/material/badge';
import { ReservationService } from '../../services/reservation.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-admin-sidebar',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    RouterLinkActive,
    MatIconModule,
    MatTooltipModule,
    MatBadgeModule
  ],
  templateUrl: './admin-sidebar.component.html',
  styleUrl: './admin-sidebar.component.css'
})
export class AdminSidebarComponent implements OnInit {
  isClosed = false;
  unassignedCount = 0;

  @HostBinding('class.closed') get closed() {
    return this.isClosed;
  }

  constructor(
    private reservationService: ReservationService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadAlerts();
  }

  loadAlerts(): void {
    this.reservationService.getUnassignedReservations().subscribe({
      next: (res) => {
        this.unassignedCount = res ? res.length : 0;
      },
      error: () => {
        this.unassignedCount = 0;
      }
    });
  }

  toggleSidebar(): void {
    this.isClosed = !this.isClosed;
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
