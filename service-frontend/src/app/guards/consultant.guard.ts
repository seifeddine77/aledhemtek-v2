import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class ConsultantGuard implements CanActivate {

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(): boolean {
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/login']);
      return false;
    }

    const role = this.authService.getRole();
    if (role === 'consultant' || role === 'admin') {
      return true;
    }

    // Role mismatch: redirect to appropriate portal
    if (role === 'client') {
      this.router.navigate(['/client/dashboard']);
    } else {
      this.router.navigate(['/home']);
    }
    return false;
  }
}
