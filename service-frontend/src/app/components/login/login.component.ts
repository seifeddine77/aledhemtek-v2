import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    FormsModule,
    RouterLink,
    CommonModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatIconModule,
    MatTooltipModule
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent implements OnInit {
  credentials = {
    email: '',
    password: ''
  };
  rememberMe = true;
  isLoading = false;
  isSuccess = false;
  hidePassword = true;
  errorMessage = '';

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    // If already logged in, redirect to respective dashboard immediately
    if (this.authService.isLoggedIn()) {
      const role = this.authService.getRole();
      if (role === 'admin') {
        this.router.navigate(['/admin/dashboard']);
      } else if (role === 'consultant') {
        this.router.navigate(['/consultant/dashboard']);
      } else if (role === 'client') {
        this.router.navigate(['/client/dashboard']);
      }
    }
  }

  onLogin(): void {
    if (!this.credentials.email || !this.credentials.password) return;
    this.isLoading = true;
    this.errorMessage = '';

    this.authService.login(this.credentials.email.trim(), this.credentials.password).subscribe({
      next: () => {
        this.isLoading = false;
        this.isSuccess = true;
      },
      error: err => {
        this.isLoading = false;
        this.isSuccess = false;
        this.errorMessage = 'Identifiants invalides. Veuillez vérifier votre adresse email et votre mot de passe.';
        console.error('Login error:', err);
      }
    });
  }

  loginAs(role: 'client' | 'consultant' | 'admin'): void {
    this.errorMessage = '';
    if (role === 'client') {
      this.credentials.email = 'client@test.com';
      this.credentials.password = 'client123';
    } else if (role === 'consultant') {
      this.credentials.email = 'consultant@test.com';
      this.credentials.password = 'consultant123';
    } else if (role === 'admin') {
      this.credentials.email = 'admin@aledhemtek.com';
      this.credentials.password = 'admin';
    }
    this.onLogin();
  }
}
