import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { cleanText } from '../../pipes/clean-text.pipe';
import { AiService } from '../../services/ai.service';

export type LegalStatusType = 'AUTO_ENTREPRENEUR' | 'SARL' | 'SAS' | 'EURL' | 'EI';

@Component({
  selector: 'app-consultant-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatChipsModule,
    MatTooltipModule,
    MatProgressBarModule,
    MatSnackBarModule
  ],
  templateUrl: './consultant-dialog.component.html',
  styleUrls: ['./consultant-dialog.component.css']
})
export class ConsultantDialogComponent {
  // Navigation du Wizard : 1 = Entreprise & IA, 2 = Métier & Compétences, 3 = Assurances & Validation
  currentStep = 1;
  readonly totalSteps = 3;

  consultantData = {
    companyName: '',
    legalStatus: 'AUTO_ENTREPRENEUR' as LegalStatusType,
    jobTitle: '',
    experienceYears: 5,
    siret: '',
    interventionRadiusKm: 25,
    skills: '',
    certifications: '',
    insuranceProvider: 'SMABTP',
    insurancePolicyNumber: '',
    insuranceExpiryDate: ''
  };

  // Liste des statuts juridiques
  legalStatuses = [
    { value: 'AUTO_ENTREPRENEUR', label: 'Micro-Entreprise / Auto-Entrepreneur (Franchise TVA)' },
    { value: 'SARL', label: 'SARL / EURL (Société à Responsabilité Limitée)' },
    { value: 'SAS', label: 'SAS / SASU (Société par Actions Simplifiée)' },
    { value: 'EI', label: 'Entreprise Individuelle (Régime Réel)' }
  ];

  // Liste des spécialités courantes
  availableSkills: string[] = [
    'Plomberie sanitaire',
    'Chauffage & Climatisation',
    'Recherche de fuite',
    'Électricité générale',
    'Tableau électrique NF C 15-100',
    'Dépannage d\'urgence 24/7',
    'Serrurerie de sécurité',
    'Rénovation salle de bain',
    'Pose de carrelage',
    'Peinture & Enduit',
    'Menuiserie bois/PVC',
    'Pompe à chaleur (PAC)'
  ];
  selectedSkills: Set<string> = new Set();

  // Liste des labels & certifications officielles BTP
  availableCertifications: string[] = [
    'Qualibat RGE',
    'Professionnel du Gaz (PG)',
    'Habilitation Électrique B1V / BR',
    'QualiPAC',
    'QualiSol',
    'CAP / BEP Métier',
    'RGE Éco-Artisan'
  ];
  selectedCertifications: Set<string> = new Set();

  resumeFile: File | null = null;
  resumeFileName: string = '';

  insuranceDocFile: File | null = null;
  insuranceDocFileName: string = '';

  // États IA & OCR
  isAnalyzingCv = false;
  aiAnalyzed = false;
  aiConfidence = 0;
  aiMessage = '';

  // État vérification SIRET
  siretStatus: 'idle' | 'valid' | 'invalid' = 'idle';
  siretMessage = '';

  constructor(
    private dialogRef: MatDialogRef<ConsultantDialogComponent>,
    private snackBar: MatSnackBar,
    private aiService: AiService
  ) {}

  // ================= NAVIGATION DU WIZARD =================
  goToStep(step: number): void {
    if (step < 1 || step > this.totalSteps) return;
    if (step > this.currentStep && !this.validateStep(this.currentStep)) {
      return;
    }
    this.currentStep = step;
  }

  nextStep(): void {
    if (this.validateStep(this.currentStep)) {
      if (this.currentStep < this.totalSteps) {
        this.currentStep++;
      }
    }
  }

  prevStep(): void {
    if (this.currentStep > 1) {
      this.currentStep--;
    }
  }

  validateStep(step: number): boolean {
    if (step === 1) {
      if (!this.consultantData.companyName.trim()) {
        this.snackBar.open('Veuillez renseigner le nom de votre entreprise.', 'Fermer', { duration: 3000 });
        return false;
      }
      if (!this.resumeFile) {
        this.snackBar.open('Veuillez joindre votre CV ou extrait Kbis.', 'Fermer', { duration: 3000 });
        return false;
      }
    } else if (step === 2) {
      if (!this.consultantData.jobTitle.trim()) {
        this.snackBar.open('Veuillez indiquer votre spécialité ou métier principal.', 'Fermer', { duration: 3000 });
        return false;
      }
    }
    return true;
  }

  // ================= GESTION DES FICHIERS =================
  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.resumeFile = file;
      this.resumeFileName = file.name;
      this.aiAnalyzed = false;
    }
  }

  onInsuranceFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.insuranceDocFile = file;
      this.insuranceDocFileName = file.name;
    }
  }

  // ================= SKILLS & CERTIFICATIONS =================
  toggleSkill(skill: string): void {
    if (this.selectedSkills.has(skill)) {
      this.selectedSkills.delete(skill);
    } else {
      this.selectedSkills.add(skill);
    }
    this.syncSkillsText();
  }

  isSkillSelected(skill: string): boolean {
    return this.selectedSkills.has(skill);
  }

  toggleCertification(cert: string): void {
    if (this.selectedCertifications.has(cert)) {
      this.selectedCertifications.delete(cert);
    } else {
      this.selectedCertifications.add(cert);
    }
    this.consultantData.certifications = Array.from(this.selectedCertifications).join(', ');
  }

  isCertificationSelected(cert: string): boolean {
    return this.selectedCertifications.has(cert);
  }

  private syncSkillsText(): void {
    this.consultantData.skills = Array.from(this.selectedSkills).join(', ');
  }

  // ================= IA & OCR SCAN =================
  analyzeWithAi(): void {
    if (!this.resumeFile) {
      this.snackBar.open('Veuillez d\'abord sélectionner un CV ou extrait Kbis (PDF ou Document).', 'Fermer', {
        duration: 3500,
        panelClass: ['modern-snackbar']
      });
      return;
    }

    this.isAnalyzingCv = true;
    this.aiService.parseResume(this.resumeFile).subscribe({
      next: (res) => {
        this.isAnalyzingCv = false;
        this.aiAnalyzed = true;
        this.aiConfidence = Math.round((res.confidenceScore || 0.85) * 100);

        if (res.companyName) {
          this.consultantData.companyName = res.companyName;
          // Détection automatique du statut juridique
          const upperComp = res.companyName.toUpperCase();
          if (upperComp.includes('SARL') || upperComp.includes('EURL')) {
            this.consultantData.legalStatus = 'SARL';
          } else if (upperComp.includes('SAS') || upperComp.includes('SASU')) {
            this.consultantData.legalStatus = 'SAS';
          } else if (upperComp.includes('EI') || upperComp.includes('INDIVIDUELLE')) {
            this.consultantData.legalStatus = 'EI';
          } else {
            this.consultantData.legalStatus = 'AUTO_ENTREPRENEUR';
          }
        }
        if (res.profession) this.consultantData.jobTitle = res.profession;
        if (res.exp) this.consultantData.experienceYears = res.exp;
        if (res.siret) {
          this.consultantData.siret = res.siret;
          this.checkSiret();
        }
        if (res.insuranceProvider) this.consultantData.insuranceProvider = res.insuranceProvider;
        if (res.insurancePolicyNumber) this.consultantData.insurancePolicyNumber = res.insurancePolicyNumber;
        if (res.insuranceExpiryDate) this.consultantData.insuranceExpiryDate = res.insuranceExpiryDate;
        if (res.suggestedRadiusKm) this.consultantData.interventionRadiusKm = res.suggestedRadiusKm;

        if (res.skills && res.skills.length > 0) {
          res.skills.forEach(s => {
            this.selectedSkills.add(s);
            if (!this.availableSkills.includes(s)) {
              this.availableSkills.push(s);
            }
          });
          this.syncSkillsText();
        }

        if (res.certifications && res.certifications.length > 0) {
          res.certifications.forEach(c => {
            this.selectedCertifications.add(c);
            if (!this.availableCertifications.includes(c)) {
              this.availableCertifications.push(c);
            }
          });
          this.consultantData.certifications = Array.from(this.selectedCertifications).join(', ');
        }

        this.snackBar.open(
          `✨ Profil analysé avec succès (${this.aiConfidence}% de confiance) ! Les 3 étapes ont été pré-remplies.`,
          'Super',
          { duration: 5500, panelClass: ['modern-snackbar'] }
        );
      },
      error: (err) => {
        this.isAnalyzingCv = false;
        console.warn('Erreur lors du parsing IA:', err);
        this.snackBar.open(
          'L\'analyse IA automatique n\'a pas pu aboutir. Vous pouvez remplir les champs manuellement.',
          'Fermer',
          { duration: 4000, panelClass: ['modern-snackbar'] }
        );
      }
    });
  }

  // ================= VÉRIFICATION SIRET =================
  checkSiret(): void {
    const raw = (this.consultantData.siret || '').replace(/\s+/g, '');
    if (!raw) {
      this.siretStatus = 'idle';
      this.siretMessage = '';
      return;
    }

    if (raw.length === 14) {
      this.aiService.verifySiret(raw).subscribe({
        next: (res) => {
          this.siretStatus = res.valid ? 'valid' : 'invalid';
          this.siretMessage = res.message;
          if (res.formatted) {
            this.consultantData.siret = res.formatted;
          }
        },
        error: () => {
          this.siretStatus = /^\d{14}$/.test(raw) ? 'valid' : 'idle';
        }
      });
    } else {
      this.siretStatus = 'invalid';
      this.siretMessage = 'Le numéro SIRET doit contenir exactement 14 chiffres.';
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onSave(): void {
    this.consultantData.companyName = cleanText(this.consultantData.companyName || '').trim();
    this.consultantData.jobTitle = cleanText(this.consultantData.jobTitle || '').trim();
    this.consultantData.siret = cleanText(this.consultantData.siret || '').replace(/\s+/g, '');
    this.consultantData.insuranceProvider = cleanText(this.consultantData.insuranceProvider || '').trim();
    this.consultantData.insurancePolicyNumber = cleanText(this.consultantData.insurancePolicyNumber || '').trim();

    if (!this.consultantData.companyName || !this.consultantData.jobTitle || !this.resumeFile) {
      this.snackBar.open(
        'Veuillez renseigner le nom de l\'entreprise, le métier et joindre votre CV / justificatif.',
        'Fermer',
        { duration: 4500, panelClass: ['modern-snackbar'] }
      );
      return;
    }

    const allSkills = Array.from(this.selectedSkills);
    if (this.selectedCertifications.size > 0) {
      allSkills.push(...Array.from(this.selectedCertifications));
    }

    const result = {
      ...this.consultantData,
      skills: allSkills.join(', '),
      resume: this.resumeFile,
      insuranceDoc: this.insuranceDocFile
    };

    this.dialogRef.close(result);
  }
}
