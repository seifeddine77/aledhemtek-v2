import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ConsultantInterface } from '../../../models/consultant-interface';
import { CleanTextPipe } from '../../../pipes/clean-text.pipe';

export interface ConsultantDossierDialogData {
  consultant: ConsultantInterface;
}

@Component({
  selector: 'app-consultant-dossier-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    CleanTextPipe
  ],
  templateUrl: './consultant-dossier-dialog.component.html',
  styleUrls: ['./consultant-dossier-dialog.component.css']
})
export class ConsultantDossierDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<ConsultantDossierDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ConsultantDossierDialogData
  ) {}

  getStatusText(status: string | undefined): string {
    switch (status) {
      case 'APPROVED': return 'Agréé & Vérifié';
      case 'REJECTED': return 'Dossier Refusé';
      case 'PENDING':
      default: return 'En attente d\'audit';
    }
  }

  onApprove(): void {
    this.dialogRef.close({ action: 'approve', consultant: this.data.consultant });
  }

  onReject(): void {
    this.dialogRef.close({ action: 'reject', consultant: this.data.consultant });
  }

  onClose(): void {
    this.dialogRef.close();
  }
}
