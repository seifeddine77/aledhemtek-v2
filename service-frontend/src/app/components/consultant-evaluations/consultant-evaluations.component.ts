import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { EvaluationService } from '../../services/evaluation.service';
import { Evaluation, EvaluationSummary } from '../../models/evaluation.model';

@Component({
  selector: 'app-consultant-evaluations',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatDividerModule
  ],
  templateUrl: './consultant-evaluations.component.html',
  styleUrls: ['./consultant-evaluations.component.css']
})
export class ConsultantEvaluationsComponent implements OnInit {
  @Input() consultantId!: number;
  @Input() showSummaryOnly = false;
  @Input() maxEvaluations = 10;

  evaluations: Evaluation[] = [];
  evaluationSummary?: EvaluationSummary;
  loading = false;

  constructor(private evaluationService: EvaluationService) {}

  ngOnInit(): void {
    if (this.consultantId) {
      this.loadEvaluations();
      this.loadEvaluationSummary();
    }
  }

  private loadEvaluations(): void {
    if (this.showSummaryOnly) return;
    
    this.loading = true;
    this.evaluationService.getConsultantEvaluations(this.consultantId).subscribe({
      next: (evaluations) => {
        this.evaluations = evaluations
          .sort((a, b) => new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime())
          .slice(0, this.maxEvaluations);
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading evaluations:', error);
        this.loading = false;
      }
    });
  }

  private loadEvaluationSummary(): void {
    this.evaluationService.getConsultantEvaluationSummary(this.consultantId).subscribe({
      next: (summary) => {
        this.evaluationSummary = summary;
      },
      error: (error) => {
        console.error('Error loading evaluation summary:', error);
      }
    });
  }

  getStarArray(rating: number): number[] {
    return Array(5).fill(0).map((_, i) => i + 1);
  }

  getRatingColor(rating: number): string {
    if (rating >= 4.5) return '#4caf50'; // Green
    if (rating >= 3.5) return '#ff9800'; // Orange
    if (rating >= 2.5) return '#f44336'; // Red
    return '#9e9e9e'; // Grey
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  getRatingText(rating: number): string {
    if (rating >= 4.5) return 'Excellent';
    if (rating >= 3.5) return 'Très bien';
    if (rating >= 2.5) return 'Bien';
    if (rating >= 1.5) return 'Moyen';
    return 'Insuffisant';
  }
}
