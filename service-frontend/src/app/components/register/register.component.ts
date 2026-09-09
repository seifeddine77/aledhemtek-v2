import { Component, OnInit } from '@angular/core';
import { CommonModule, formatDate } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ClientInterface } from '../../models/client-interface';
import { ConsultantDialogComponent } from '../consultant-dialog/consultant-dialog.component';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    MatCardModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatTooltipModule,
    MatProgressBarModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {
  client: ClientInterface = {
    email: '',
    firstName: '',
    lastName: '',
    password: '',
    phone: '',
    dob: '',
    country: 'France',
    city: '',
    zip: '',
    address: '',
    occupation: 'client',
  };

  confirmPassword = '';
  hidePassword = true;
  hideConfirmPassword = true;
  termsAccepted = true;

  profile_picture: File | null = null;
  profile_picture_preview: string | ArrayBuffer | null | undefined = null;
  selectedFileName = '';

  isLoading = false;
  errorMessage = '';
  successMessage = '';
  selectedOccupation: 'client' | 'consultant' = 'client';
  hasConsultantData = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    if (this.authService.isLoggedIn()) {
      const role = this.authService.getRole();
      if (role === 'admin') this.router.navigate(['/admin/dashboard']);
      else if (role === 'consultant') this.router.navigate(['/consultant/dashboard']);
      else this.router.navigate(['/client/dashboard']);
    }
  }

  // Password strength calculator matching backend policy
  get passwordStrengthScore(): number {
    const pwd = this.client.password || '';
    if (!pwd) return 0;
    let score = 0;
    if (pwd.length >= 8) score++;
    if (/[a-z]/.test(pwd)) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/\d/.test(pwd)) score++;
    if (/[^a-zA-Z0-9]/.test(pwd)) score++;
    return score;
  }

  get passwordStrengthPercentage(): number {
    return (this.passwordStrengthScore / 5) * 100;
  }

  get passwordStrengthLabel(): string {
    const score = this.passwordStrengthScore;
    if (score <= 1) return 'Très faible';
    if (score === 2) return 'Faible';
    if (score === 3) return 'Moyen';
    if (score === 4) return 'Bon';
    return 'Excellent & Conforme';
  }

  get passwordStrengthColor(): string {
    const score = this.passwordStrengthScore;
    if (score <= 1) return '#ef4444';
    if (score === 2) return '#f97316';
    if (score === 3) return '#eab308';
    if (score === 4) return '#3b82f6';
    return '#10b981';
  }

  get isPasswordValid(): boolean {
    const pwd = this.client.password || '';
    return pwd.length >= 8 &&
      /[a-z]/.test(pwd) &&
      /[A-Z]/.test(pwd) &&
      /\d/.test(pwd) &&
      /[^a-zA-Z0-9]/.test(pwd);
  }

  get hasMinLength(): boolean {
    return (this.client.password?.length || 0) >= 8;
  }

  get hasUppercase(): boolean {
    return /[A-Z]/.test(this.client.password || '');
  }

  get hasLowercase(): boolean {
    return /[a-z]/.test(this.client.password || '');
  }

  get hasNumber(): boolean {
    return /\d/.test(this.client.password || '');
  }

  get hasSpecial(): boolean {
    return /[^a-zA-Z0-9]/.test(this.client.password || '');
  }

  get doPasswordsMatch(): boolean {
    return !!this.confirmPassword && this.client.password === this.confirmPassword;
  }

  onOccupationChange(value: 'client' | 'consultant'): void {
    this.selectedOccupation = value;
    this.client.occupation = value;

    if (value === 'consultant' && !this.hasConsultantData) {
      this.openConsultantDialog();
    }
  }

  openConsultantDialog(): void {
    const dialogRef = this.dialog.open(ConsultantDialogComponent, {
      width: '520px',
      maxWidth: '92vw',
      disableClose: false,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.client.occupation = 'consultant';
        this.selectedOccupation = 'consultant';
        (this.client as any).consultantData = {
          companyName: result.companyName,
          jobTitle: result.jobTitle,
          experienceYears: result.experienceYears,
          siret: result.siret,
          insuranceProvider: result.insuranceProvider,
          insurancePolicyNumber: result.insurancePolicyNumber,
          insuranceExpiryDate: result.insuranceExpiryDate,
          interventionRadiusKm: result.interventionRadiusKm,
          skills: result.skills
        };
        (this.client as any).resumeFile = result.resume;
        (this.client as any).insuranceDocFile = result.insuranceDoc;
        this.hasConsultantData = true;
      } else if (!this.hasConsultantData) {
        // Kept on client if cancelled
        this.client.occupation = 'client';
        this.selectedOccupation = 'client';
      }
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      if (!file.type.startsWith('image/')) {
        this.errorMessage = 'Veuillez sélectionner un fichier image valide (JPG, PNG, WEBP).';
        return;
      }
      this.profile_picture = file;
      this.selectedFileName = file.name;
      const reader = new FileReader();
      reader.onload = (e) => {
        this.profile_picture_preview = e.target?.result;
      };
      reader.readAsDataURL(file);
    }
  }

  resetImage(): void {
    this.profile_picture_preview = null;
    this.selectedFileName = '';
    this.profile_picture = null;
  }

  resetForm(): void {
    this.client = {
      email: '',
      firstName: '',
      lastName: '',
      password: '',
      phone: '',
      dob: '',
      country: 'France',
      city: '',
      zip: '',
      address: '',
      occupation: 'client',
    };
    this.confirmPassword = '';
    this.selectedOccupation = 'client';
    this.hasConsultantData = false;
    this.profile_picture = null;
    this.profile_picture_preview = null;
    this.errorMessage = '';
    this.successMessage = '';
  }

  onSubmit(): void {
    this.errorMessage = '';
    this.successMessage = '';

    // Validate required fields
    if (!this.client.firstName || !this.client.lastName || !this.client.email || !this.client.password) {
      this.errorMessage = 'Veuillez renseigner tous les champs obligatoires (Prénom, Nom, Email, Mot de passe).';
      return;
    }

    // Validate password criteria
    if (!this.isPasswordValid) {
      this.errorMessage = 'Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule, un chiffre et un caractère spécial.';
      return;
    }

    // Validate password match
    if (!this.doPasswordsMatch) {
      this.errorMessage = 'Les deux mots de passe ne correspondent pas.';
      return;
    }

    // Validate consultant portfolio if selected
    if (this.selectedOccupation === 'consultant' && !this.hasConsultantData) {
      this.errorMessage = 'Veuillez renseigner les informations professionnelles relatives à votre activité artisanale.';
      return;
    }

    this.isLoading = true;

    try {
      const formData = new FormData();
      formData.append('firstName', this.client.firstName.trim());
      formData.append('lastName', this.client.lastName.trim());
      formData.append('email', this.client.email.trim());
      formData.append('password', this.client.password);

      if (this.client.phone) formData.append('phone', this.client.phone);
      if (this.client.dob) {
        formData.append('dob', formatDate(this.client.dob, 'yyyy-MM-dd', 'en-US'));
      }
      if (this.client.country) formData.append('country', this.client.country);
      if (this.client.city) formData.append('city', this.client.city);
      if (this.client.zip) formData.append('zip', this.client.zip.toString());
      if (this.client.address) formData.append('address', this.client.address);
      if (this.profile_picture) formData.append('profilePic', this.profile_picture);

      if (this.selectedOccupation === 'consultant') {
        const consultantData = (this.client as any).consultantData || {};
        formData.append('profession', consultantData.jobTitle || 'Artisan');
        formData.append('exp', consultantData.experienceYears?.toString() || '3');
        formData.append('companyName', consultantData.companyName || 'Artisan Indépendant');
        if (consultantData.siret) formData.append('siret', consultantData.siret);
        if (consultantData.insuranceProvider) formData.append('insuranceProvider', consultantData.insuranceProvider);
        if (consultantData.insurancePolicyNumber) formData.append('insurancePolicyNumber', consultantData.insurancePolicyNumber);
        if (consultantData.insuranceExpiryDate) formData.append('insuranceExpiryDate', consultantData.insuranceExpiryDate);
        if (consultantData.interventionRadiusKm) formData.append('interventionRadiusKm', consultantData.interventionRadiusKm.toString());
        if (consultantData.skills) formData.append('skills', consultantData.skills);

        if ((this.client as any).resumeFile) {
          formData.append('resume', (this.client as any).resumeFile);
        }
        if ((this.client as any).insuranceDocFile) {
          formData.append('insuranceDoc', (this.client as any).insuranceDocFile);
        }

        this.authService.registerConsultant(formData).subscribe({
          next: () => {
            this.isLoading = false;
            this.successMessage = 'Votre dossier artisan a été transmis avec succès ! Nos équipes valideront vos agréments sous 24h.';
            setTimeout(() => this.router.navigate(['/login']), 2000);
          },
          error: (err) => {
            this.isLoading = false;
            this.errorMessage = err.error?.message || err.error || 'Échec lors de l\'enregistrement de votre dossier artisan.';
          }
        });
      } else {
        // Client registration
        this.authService.registerClient(formData).subscribe({
          next: () => {
            this.isLoading = false;
            this.successMessage = 'Votre compte client a été créé avec succès ! Redirection vers la page de connexion...';
            setTimeout(() => this.router.navigate(['/login']), 1800);
          },
          error: (err) => {
            this.isLoading = false;
            this.errorMessage = err.error?.message || err.error || 'Échec lors de la création de votre compte client.';
          }
        });
      }
    } catch (e: any) {
      this.isLoading = false;
      this.errorMessage = 'Une erreur inattendue est survenue : ' + (e.message || e);
    }
  }
}
