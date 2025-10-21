import { Component, OnInit, inject } from '@angular/core';
import { ConsultantService } from '../../services/consultant.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { ConsultantInterface } from '../../models/consultant-interface';
import { MatIcon } from '@angular/material/icon';
import { MatTooltip } from '@angular/material/tooltip';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-manage-consultants',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatButtonModule,
    MatIcon,
    MatTooltip,
    MatCardModule,
    MatChipsModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './manage-consultants.component.html',
  styleUrls: ['./manage-consultants.component.css']
})
export class ManageConsultantsComponent implements OnInit {
  consultantService = inject(ConsultantService);
  snackBar = inject(MatSnackBar);
  consultants: ConsultantInterface[] = [];
  displayedColumns = ['id', 'name', 'email', 'profession', 'experience', 'company', 'status', 'resume', 'actions'];
  loading = false;

  ngOnInit(): void {
    this.fetchAll();
  }

  fetchAll() {
    this.loading = true;
    this.consultantService.getAll().subscribe({
      next: (data) => {
        this.consultants = data;
        this.loading = false;
        console.log('Consultants chargés:', data);
        console.log('Premier consultant resumePath:', data[0]?.resumePath);
        console.log('Premier consultant exp:', data[0]?.exp);
        console.log('Premier consultant companyName:', data[0]?.companyName);
        console.log('Premier consultant profession:', data[0]?.profession);
        console.log('Toutes les propriétés du premier consultant:', data[0]);
      },
      error: (error) => {
        console.error('Erreur lors du chargement des consultants:', error);
        this.snackBar.open('Erreur lors du chargement des consultants', 'Fermer', { duration: 3000 });
        this.loading = false;
      }
    });
  }

  approve(consultant: ConsultantInterface) {
    this.loading = true;
    this.consultantService.approve(consultant.id!).subscribe({
      next: () => {
        this.snackBar.open('Consultant approved', 'Close', { duration: 2000 });
        this.fetchAll();
      },
      complete: () => this.loading = false
    });
  }

  reject(id: number) {
    this.consultantService.reject(id).subscribe(() => {
      this.snackBar.open('Consultant rejected', 'Close', { duration: 2000 });
      this.fetchAll();
    });
  }

  delete(id: number) {
    this.consultantService.delete(id).subscribe(() => {
      this.snackBar.open('Consultant deleted', 'Close', { duration: 2000 });
      this.fetchAll();
    });
  }

  viewResume(consultant: ConsultantInterface) {
    if (!consultant.resumePath) {
      this.snackBar.open('Aucun CV disponible pour ce consultant', 'Fermer', { duration: 3000 });
      return;
    }
    
    console.log('=== DÉBOGAGE CV ===');
    console.log('Visualisation CV pour:', consultant.firstName, consultant.lastName);
    console.log('Resume path brut:', consultant.resumePath);
    
    const resumeUrl = this.consultantService.getResumeUrl(consultant.resumePath);
    console.log('URL générée:', resumeUrl);
    
    // Ouvrir directement l'URL (l'endpoint backend gère l'authentification)
    console.log('✅ Ouverture du CV dans un nouvel onglet');
    window.open(resumeUrl, '_blank');
  }

  downloadResume(consultant: ConsultantInterface) {
    if (!consultant.resumePath) {
      this.snackBar.open('Aucun CV disponible pour ce consultant', 'Fermer', { duration: 3000 });
      return;
    }
    
    console.log('=== TÉLÉCHARGEMENT CV ===');
    console.log('Téléchargement CV pour:', consultant.firstName, consultant.lastName);
    console.log('Resume path:', consultant.resumePath);
    
    // Utiliser un lien direct avec paramètre download pour forcer le téléchargement
    const resumeUrl = this.consultantService.getResumeUrl(consultant.resumePath) + '?download=true';
    console.log('URL de téléchargement:', resumeUrl);
    
    // Créer un lien de téléchargement direct
    const a = document.createElement('a');
    a.href = resumeUrl;
    a.download = `CV_${consultant.firstName}_${consultant.lastName}.pdf`;
    a.target = '_blank'; // Ouvrir dans un nouvel onglet au cas où le téléchargement ne fonctionne pas
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    
    console.log('✅ Lien de téléchargement créé et cliqué');
    this.snackBar.open('Téléchargement du CV lancé', 'Fermer', { duration: 2000 });
  }

  getStatusColor(status: string): string {
    switch (status?.toLowerCase()) {
      case 'approved': return 'primary';
      case 'pending': return 'accent';
      case 'rejected': return 'warn';
      default: return '';
    }
  }

  getStatusText(status: string): string {
    switch (status?.toLowerCase()) {
      case 'approved': return 'Approuvé';
      case 'pending': return 'En attente';
      case 'rejected': return 'Rejeté';
      default: return status || 'Inconnu';
    }
  }
}
