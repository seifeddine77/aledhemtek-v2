import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonModule } from '@angular/material/button';
import { RouterModule } from '@angular/router';
import { EvaluationService } from '../../../services/evaluation.service';
import { Evaluation } from '../../../models/evaluation.model';

@Component({
  selector: 'app-evaluation-stats',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatButtonModule,
    RouterModule
  ],
  templateUrl: './evaluation-stats.component.html',
  styleUrls: ['./evaluation-stats.component.css']
})
export class EvaluationStatsComponent implements OnInit {
  loading = true;
  evaluations: Evaluation[] = [];
  
  stats = {
    totalEvaluations: 0,
    averageRating: 0,
    excellentCount: 0,
    goodCount: 0,
    averageCount: 0,
    poorCount: 0,
    recentCount: 0,
    withCommentsCount: 0,
    averageGeneralRating: 0,
    averageServiceQuality: 0,
    averagePunctuality: 0,
    averageCommunication: 0
  };

  constructor(private evaluationService: EvaluationService) {}

  ngOnInit(): void {
    this.loadEvaluationStats();
  }

  loadEvaluationStats(): void {
    this.loading = true;
    
    this.evaluationService.getAllEvaluations().subscribe({
      next: (evaluations) => {
        this.evaluations = evaluations;
        this.calculateStats();
        this.loading = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des statistiques:', error);
        this.loading = false;
      }
    });
  }

  private calculateStats(): void {
    this.stats.totalEvaluations = this.evaluations.length;

    if (this.evaluations.length === 0) return;

    // Calculate averages
    const totalGeneral = this.evaluations.reduce((sum, e) => sum + e.generalRating, 0);
    const totalServiceQuality = this.evaluations.reduce((sum, e) => sum + e.serviceQualityRating, 0);
    const totalPunctuality = this.evaluations.reduce((sum, e) => sum + e.punctualityRating, 0);
    const totalCommunication = this.evaluations.reduce((sum, e) => sum + e.communicationRating, 0);

    this.stats.averageGeneralRating = totalGeneral / this.evaluations.length;
    this.stats.averageServiceQuality = totalServiceQuality / this.evaluations.length;
    this.stats.averagePunctuality = totalPunctuality / this.evaluations.length;
    this.stats.averageCommunication = totalCommunication / this.evaluations.length;

    // Overall average
    this.stats.averageRating = (
      this.stats.averageGeneralRating +
      this.stats.averageServiceQuality +
      this.stats.averagePunctuality +
      this.stats.averageCommunication
    ) / 4;

    // Rating distribution
    this.evaluations.forEach(evaluation => {
      const avgRating = this.getEvaluationAverage(evaluation);
      if (avgRating >= 4.5) this.stats.excellentCount++;
      else if (avgRating >= 3.5) this.stats.goodCount++;
      else if (avgRating >= 2.5) this.stats.averageCount++;
      else this.stats.poorCount++;
    });

    // Recent evaluations (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    this.stats.recentCount = this.evaluations.filter(e => 
      new Date(e.createdAt || '') >= sevenDaysAgo
    ).length;

    // Evaluations with comments
    this.stats.withCommentsCount = this.evaluations.filter(e => 
      e.comment && e.comment.trim().length > 0
    ).length;
  }

  getEvaluationAverage(evaluation: Evaluation): number {
    return (
      evaluation.generalRating +
      evaluation.serviceQualityRating +
      evaluation.punctualityRating +
      evaluation.communicationRating
    ) / 4;
  }

  getPercentage(count: number): number {
    return this.stats.totalEvaluations > 0 ? (count / this.stats.totalEvaluations) * 100 : 0;
  }

  getRatingColor(rating: number): string {
    if (rating >= 4.5) return '#4caf50';
    if (rating >= 3.5) return '#ff9800';
    if (rating >= 2.5) return '#2196f3';
    return '#f44336';
  }

  getRatingText(rating: number): string {
    if (rating >= 4.5) return 'Excellent';
    if (rating >= 3.5) return 'Très bien';
    if (rating >= 2.5) return 'Bien';
    if (rating >= 1.5) return 'Moyen';
    return 'Insuffisant';
  }
}
