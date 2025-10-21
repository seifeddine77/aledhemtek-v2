import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CommonModule, DatePipe } from '@angular/common';
import { EvaluationService } from '../../services/evaluation.service';
import { Evaluation } from '../../models/evaluation.model';
import { Reservation } from '../../models/reservation.model';

@Component({
  selector: 'app-evaluation-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    DatePipe
  ],
  templateUrl: './evaluation-form.component.html',
  styleUrls: ['./evaluation-form.component.css']
})
export class EvaluationFormComponent implements OnInit {
  evaluationForm!: FormGroup;
  loading = false;
  reservation: Reservation;
  existingEvaluation?: Evaluation;

  constructor(
    private fb: FormBuilder,
    private evaluationService: EvaluationService,
    private snackBar: MatSnackBar,
    public dialogRef: MatDialogRef<EvaluationFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { reservation: Reservation, evaluation?: Evaluation }
  ) {
    this.reservation = data.reservation;
    this.existingEvaluation = data.evaluation;
  }

  ngOnInit(): void {
    this.initializeForm();
  }

  private initializeForm(): void {
    this.evaluationForm = this.fb.group({
      generalRating: [this.existingEvaluation?.generalRating || 5, [Validators.required, Validators.min(1), Validators.max(5)]],
      serviceQualityRating: [this.existingEvaluation?.serviceQualityRating || 5, [Validators.required, Validators.min(1), Validators.max(5)]],
      punctualityRating: [this.existingEvaluation?.punctualityRating || 5, [Validators.required, Validators.min(1), Validators.max(5)]],
      communicationRating: [this.existingEvaluation?.communicationRating || 5, [Validators.required, Validators.min(1), Validators.max(5)]],
      comment: [this.existingEvaluation?.comment || '', [Validators.maxLength(1000)]]
    });
  }

  onSubmit(): void {
    if (this.evaluationForm.valid) {
      this.loading = true;
      
      const evaluationData: Evaluation = {
        ...this.evaluationForm.value,
        reservationId: this.reservation.id!,
        clientId: this.reservation.clientId
      };

      const operation = this.existingEvaluation 
        ? this.evaluationService.updateEvaluation(this.existingEvaluation.id!, evaluationData)
        : this.evaluationService.createEvaluation(evaluationData);

      operation.subscribe({
        next: (result) => {
          this.loading = false;
          const message = this.existingEvaluation 
            ? 'Évaluation mise à jour avec succès'
            : 'Évaluation créée avec succès';
          this.snackBar.open(message, 'Fermer', { duration: 3000 });
          this.dialogRef.close(result);
        },
        error: (error) => {
          this.loading = false;
          console.error('Erreur lors de la sauvegarde de l\'évaluation:', error);
          this.snackBar.open('Erreur lors de la sauvegarde', 'Fermer', { duration: 3000 });
        }
      });
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  getStarArray(rating: number): number[] {
    return Array(5).fill(0).map((_, i) => i + 1);
  }

  setRating(field: string, rating: number): void {
    this.evaluationForm.patchValue({ [field]: rating });
  }

  getRating(field: string): number {
    return this.evaluationForm.get(field)?.value || 0;
  }
}
