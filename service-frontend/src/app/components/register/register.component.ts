
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ClientInterface } from '../../models/client-interface';
import { ConsultantDialogComponent } from '../consultant-dialog/consultant-dialog.component';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { formatDate } from '@angular/common';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatDatepickerModule,
    MatNativeDateModule
  ],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  client: ClientInterface = {
    email: '',
    firstName: '',
    lastName: '',
    password: '',
    phone: '',
    dob: '',
    country: '',
    city: '',
    zip: '',
    address: '',
    occupation: '',
  };

  occupations: string[] = ['Client', 'Consultant'];
  profile_picture: File | null = null;
  profile_picture_preview: string | ArrayBuffer | null | undefined = null;
  isLoading = false;
  errorMessage = '';
  selectedOccupation: string = '';
  selectedFileName: string = '';
  hidePassword = true;

  constructor(
    private authService: AuthService,
    private router: Router,
    private dialog: MatDialog
  ) {}

  onOccupationChange(value: string) {
    this.selectedOccupation = value;

    if (value === 'consultant') {
      const dialogRef = this.dialog.open(ConsultantDialogComponent, {
        width: '400px',
        disableClose: true,
      });

      dialogRef.afterClosed().subscribe((result) => {
        if (result) {
          console.log('[DEBUG] Received from ConsultantDialog:', result);
          this.client.occupation = 'consultant';
          (this.client as any).consultantData = {
            companyName: result.companyName,
            jobTitle: result.jobTitle,
            experienceYears: result.experienceYears
          };
          (this.client as any).resumeFile = result.resume; // ✅ Attach the file
        } else {
          console.log('[DEBUG] ConsultantDialog was closed without data');
          // Optional: reset occupation if cancelled
          this.client.occupation = '';
          this.selectedOccupation = '';
        }
      });

    } else {
      this.client.occupation = 'client';
    }
  }


  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      if (!file.type.startsWith('image/')) {
        this.errorMessage = 'Please upload an image file';
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

  resetForm() {
    this.client = {
      email: '',
      firstName: '',
      lastName: '',
      password: '',
      phone: '',
      dob: '',
      country: '',
      city: '',
      zip: '',
      address: '',
      occupation: '',
    };
    this.selectedOccupation = '';
    this.profile_picture = null;
    this.profile_picture_preview = null;
    this.errorMessage = '';
  }
  onSubmit(): void {
    this.isLoading = true;
    this.errorMessage = '';

    // Validate required fields
    if (!this.client.firstName || !this.client.lastName || !this.client.email || !this.client.password || !this.client.dob) {
      this.isLoading = false;
      this.errorMessage = 'Please fill all required fields: First Name, Last Name, Email, Password, Date of Birth';
      alert(this.errorMessage);
      return;
    }

    try {
      console.log('Submitting registration form...');
      console.log('Selected occupation:', this.client.occupation);
      console.log('Client object:', this.client);

      const formData = new FormData();
      formData.append('firstName', this.client.firstName);
      formData.append('lastName', this.client.lastName);
      formData.append('email', this.client.email);
      formData.append('password', this.client.password);

      // Optional fields
      if (this.client.phone && /^\d+$/.test(this.client.phone)) {
        formData.append('phone', this.client.phone);
      }
      if (this.client.dob) {
        formData.append('dob', formatDate(this.client.dob, 'yyyy-MM-dd', 'en-US'));
      }
      if (this.client.country) {
        formData.append('country', this.client.country);
      }
      if (this.client.city) {
        formData.append('city', this.client.city);
      }
      if (this.client.zip && /^\d+$/.test(this.client.zip)) {
        formData.append('zip', this.client.zip);
      }
      if (this.client.address) {
        formData.append('address', this.client.address);
      }
      if (this.profile_picture) {
        formData.append('profilePic', this.profile_picture);
      }

      // Check if salarie
      if (this.client.occupation === 'consultant') {
        const consultantData = (this.client as any).consultantData || {};
        formData.append('profession', consultantData.jobTitle || '');
        //formData.append('exp', consultantData.experienceYears || '');
        formData.append('exp', consultantData.experienceYears?.toString() || '');
        formData.append('companyName', consultantData.companyName || '');
        if ((this.client as any).resumeFile) {
          formData.append('resume', (this.client as any).resumeFile);
        }

        // Debugging
        console.log('[DEBUG] FormData for consultant registration:');
        formData.forEach((val, key) => {
          if (val instanceof File) {
            console.log(`  ${key}: File { name: ${val.name}, size: ${val.size} bytes }`);
          } else {
            console.log(`  ${key}: ${val}`);
          }
        });

        this.authService.registerConsultant(formData).subscribe({
          next: (res) => {
            this.isLoading = false;
            console.log('✅ Consultant registered successfully:', res);
            alert('Consultant registered successfully. Awaiting admin approval.');
            this.router.navigate(['/login']);
          },
          error: (err) => {
            this.isLoading = false;
            console.error('❌ Error registering consultant:', err);
            this.errorMessage = err.error?.message || 'Failed to register consultant.';
            alert(this.errorMessage);
          }
        });

      } else {
        // Default: client
        console.log('[DEBUG] FormData for client registration:');
        formData.forEach((val, key) => {
          if (val instanceof File) {
            console.log(`  ${key}: File { name: ${val.name}, size: ${val.size} bytes }`);
          } else {
            console.log(`  ${key}: ${val}`);
          }
        });

        this.authService.registerClient(formData).subscribe({
          next: (res) => {
            this.isLoading = false;
            console.log('✅ Client registered successfully:', res);
            alert('Client registered successfully');
            this.router.navigate(['/login']);
          },
          error: (err) => {
            this.isLoading = false;
            console.error('❌ Client registration error:', err);
            this.errorMessage = err.error?.message || 'Failed to register client.';
            alert(this.errorMessage);
          }
        });
      }

    } catch (e) {
      this.isLoading = false;
      this.errorMessage = 'An unexpected error occurred.';
      console.error('Unexpected error in onSubmit:', e);
      alert(this.errorMessage);
    }
  }

}
