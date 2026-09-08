import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
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
    MatTooltipModule,
    RouterModule
  ],
  templateUrl: './evaluation-stats.component.html',
  styleUrls: ['./evaluation-stats.component.css']
})
export class EvaluationStatsComponent implements OnInit {
  loading = true;
  evaluations: Evaluation[] = [];
  recentFeedback: Evaluation[] = [];
  
  stats = {
    totalEvaluations: 0,
    averageRating: 0,
    fiveStarCount: 0,
    fourStarCount: 0,
    threeStarCount: 0,
    twoStarCount: 0,
    oneStarCount: 0,
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
        this.evaluations = evaluations || [];
        this.calculateStats();
        this.recentFeedback = this.evaluations
          .filter(e => e.comment && e.comment.trim().length > 0)
          .slice(0, 3);
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

    // Reset counters
    this.stats.fiveStarCount = 0;
    this.stats.fourStarCount = 0;
    this.stats.threeStarCount = 0;
    this.stats.twoStarCount = 0;
    this.stats.oneStarCount = 0;

    if (this.evaluations.length === 0) return;

    // Calculate averages
    const totalGeneral = this.evaluations.reduce((sum, e) => sum + (e.generalRating || 0), 0);
    const totalServiceQuality = this.evaluations.reduce((sum, e) => sum + (e.serviceQualityRating || 0), 0);
    const totalPunctuality = this.evaluations.reduce((sum, e) => sum + (e.punctualityRating || 0), 0);
    const totalCommunication = this.evaluations.reduce((sum, e) => sum + (e.communicationRating || 0), 0);

    this.stats.averageGeneralRating = Math.round((totalGeneral / this.evaluations.length) * 10) / 10;
    this.stats.averageServiceQuality = Math.round((totalServiceQuality / this.evaluations.length) * 10) / 10;
    this.stats.averagePunctuality = Math.round((totalPunctuality / this.evaluations.length) * 10) / 10;
    this.stats.averageCommunication = Math.round((totalCommunication / this.evaluations.length) * 10) / 10;

    // Overall average
    this.stats.averageRating = Math.round(((
      this.stats.averageGeneralRating +
      this.stats.averageServiceQuality +
      this.stats.averagePunctuality +
      this.stats.averageCommunication
    ) / 4) * 10) / 10;

    // Star Distribution (1 to 5 stars)
    this.evaluations.forEach(evaluation => {
      const avgRating = this.getEvaluationAverage(evaluation);
      if (avgRating >= 4.5) this.stats.fiveStarCount++;
      else if (avgRating >= 3.5) this.stats.fourStarCount++;
      else if (avgRating >= 2.5) this.stats.threeStarCount++;
      else if (avgRating >= 1.5) this.stats.twoStarCount++;
      else this.stats.oneStarCount++;
    });

    // Recent evaluations (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    this.stats.recentCount = this.evaluations.filter(e => 
      e.createdAt ? new Date(e.createdAt) >= sevenDaysAgo : false
    ).length;

    // Evaluations with comments
    this.stats.withCommentsCount = this.evaluations.filter(e => 
      e.comment && e.comment.trim().length > 0
    ).length;
  }

  getEvaluationAverage(evaluation: Evaluation): number {
    return (
      (evaluation.generalRating || 0) +
      (evaluation.serviceQualityRating || 0) +
      (evaluation.punctualityRating || 0) +
      (evaluation.communicationRating || 0)
    ) / 4;
  }

  getPercentage(count: number): number {
    return this.stats.totalEvaluations > 0 ? Math.round((count / this.stats.totalEvaluations) * 100) : 0;
  }

  getStarArray(rating: number): number[] {
    const fullStars = Math.round(rating);
    return Array(Math.min(5, Math.max(0, fullStars))).fill(1);
  }

  getEmptyStarArray(rating: number): number[] {
    const fullStars = Math.round(rating);
    return Array(Math.max(0, 5 - fullStars)).fill(1);
  }

  refresh(): void {
    this.loadEvaluationStats();
  }
}
