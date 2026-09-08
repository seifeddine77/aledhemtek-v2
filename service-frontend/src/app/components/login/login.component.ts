import { Component } from '@angular/core';
import {FormsModule} from '@angular/forms';
import {RouterLink} from '@angular/router';
import {CommonModule} from '@angular/common';
import {AuthService} from '../../services/auth.service';
import {Router} from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';

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
    MatIconModule
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  credentials = {
    email :'',
    password : ''
  };
  isLoading = false;
  hidePassword = true;
  errorMessage = '';

  constructor(private authService: AuthService, private router: Router) {}

  onLogin(): void {
    if (!this.credentials.email || !this.credentials.password) return;
    this.isLoading = true;
    this.errorMessage = '';

    this.authService.login(this.credentials.email, this.credentials.password).subscribe({
      next: () => {
        this.isLoading = false;
      },
      error: err => {
        this.isLoading = false;
        this.errorMessage = 'Identifiants invalides. Veuillez vérifier votre email et mot de passe.';
        console.error(err);
      }
    });
  }
}
