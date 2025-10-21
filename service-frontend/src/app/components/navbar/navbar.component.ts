import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    RouterLinkActive,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent implements OnInit, OnDestroy {
  isLoggedIn = false;
  userRole: string | null = null;
  private authSubscription!: Subscription;

  constructor(private router: Router, private authService: AuthService) {}

  ngOnInit(): void {
    this.authSubscription = this.authService.getAuthStatusListener().subscribe((isAuthenticated: boolean) => {
      this.isLoggedIn = isAuthenticated;
      if (this.isLoggedIn) {
        this.userRole = this.authService.getRole();
      } else {
        this.userRole = null;
      }
    });
  }

  getDashboardLink(): string {
    switch (this.userRole) {
      case 'admin':
        return '/admin/dashboard';
      case 'client':
        return '/client/dashboard';
      case 'consultant':
        return '/consultant/dashboard';
      default:
        return '/login';
    }
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  ngOnDestroy(): void {
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
  }
}
