import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatMenuModule } from '@angular/material/menu';
import { FormsModule } from '@angular/forms';
import { EvaluationService } from '../../../services/evaluation.service';
import { ReservationService } from '../../../services/reservation.service';
import { NotificationService } from '../../../services/notification.service';
import { Evaluation } from '../../../models/evaluation.model';
import { Reservation } from '../../../models/reservation.model';
import { PaginationComponent, PaginationConfig } from '../../shared/pagination/pagination.component';

@Component({
  selector: 'app-admin-evaluations',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatDialogModule,
    MatTooltipModule,
    MatMenuModule,
    FormsModule,
    PaginationComponent
  ],
  templateUrl: './admin-evaluations.component.html',
  styleUrls: ['./admin-evaluations.component.css']
})
export class AdminEvaluationsComponent implements OnInit {
  evaluations: Evaluation[] = [];
  filteredEvaluations: Evaluation[] = [];
  reservations: Map<number, Reservation> = new Map();
  loading = true;
  
  // Filters
  searchTerm = '';
  ratingFilter = '';
  dateFilter = '';
  
  // Statistics
  stats = {
    totalEvaluations: 0,
    averageRating: 0,
    excellentCount: 0,
    goodCount: 0,
    averageCount: 0,
    poorCount: 0,
    recentEvaluations: 0
  };

  // Table configuration
  displayedColumns: string[] = [
    'id',
    'client',
    'consultant', 
    'reservation',
    'ratings',
    'averageRating',
    'comment',
    'date',
    'actions'
  ];

  // Pagination
  paginationConfig: PaginationConfig = {
    currentPage: 1,
    totalItems: 0,
    itemsPerPage: 10,
    pageSizeOptions: [5, 10, 25, 50]
  };
  
  paginatedEvaluations: Evaluation[] = [];

  constructor(
    private evaluationService: EvaluationService,
    private reservationService: ReservationService,
    private notificationService: NotificationService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadAllEvaluations();
  }

  loadAllEvaluations(): void {
    this.loading = true;
    
    this.evaluationService.getAllEvaluations().subscribe({
      next: (evaluations) => {
        this.evaluations = evaluations.sort((a, b) => 
          new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime()
        );
        this.calculateStatistics();
        this.loadReservationDetails();
        this.applyFilters();
      },
      error: (error) => {
        console.error('Erreur lors du chargement des évaluations:', error);
        this.snackBar.open('Erreur lors du chargement des évaluations', 'Fermer', { duration: 3000 });
        this.loading = false;
      }
    });
  }

  private loadReservationDetails(): void {
    const reservationIds = [...new Set(this.evaluations.map(e => e.reservationId))];
    let loadedCount = 0;

    if (reservationIds.length === 0) {
      this.loading = false;
      return;
    }

    reservationIds.forEach(id => {
      this.reservationService.getReservationById(id).subscribe({
        next: (reservation) => {
          this.reservations.set(id, reservation);
          loadedCount++;
          if (loadedCount === reservationIds.length) {
            this.loading = false;
          }
        },
        error: (error) => {
          console.error(`Erreur lors du chargement de la réservation ${id}:`, error);
          loadedCount++;
          if (loadedCount === reservationIds.length) {
            this.loading = false;
          }
        }
      });
    });
  }

  calculateStatistics(): void {
    this.stats.totalEvaluations = this.evaluations.length;

    if (this.evaluations.length === 0) return;

    // Calculate average rating
    const totalRating = this.evaluations.reduce((sum, e) => sum + this.getEvaluationAverage(e), 0);
    this.stats.averageRating = totalRating / this.evaluations.length;

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
    
    this.stats.recentEvaluations = this.evaluations.filter(e => 
      new Date(e.createdAt || '') >= sevenDaysAgo
    ).length;
  }

  applyFilters(): void {
    this.filteredEvaluations = this.evaluations.filter(evaluation => {
      const reservation = this.reservations.get(evaluation.reservationId);
      const matchesSearch = !this.searchTerm || 
        (reservation?.clientName?.toLowerCase().includes(this.searchTerm.toLowerCase())) ||
        (reservation?.consultantName?.toLowerCase().includes(this.searchTerm.toLowerCase())) ||
        (evaluation.comment?.toLowerCase().includes(this.searchTerm.toLowerCase()));

      const matchesRating = !this.ratingFilter || 
        this.getRatingCategory(this.getEvaluationAverage(evaluation)) === this.ratingFilter;

      return matchesSearch && matchesRating;
    });
    
    // Réinitialiser à la première page après filtrage
    this.paginationConfig.currentPage = 1;
    this.updatePagination();
  }

  onSearchChange(): void {
    this.applyFilters();
  }

  onRatingFilterChange(): void {
    this.applyFilters();
  }

  getReservation(reservationId: number): Reservation | undefined {
    return this.reservations.get(reservationId);
  }

  getEvaluationAverage(evaluation: Evaluation): number {
    return (
      evaluation.generalRating +
      evaluation.serviceQualityRating +
      evaluation.punctualityRating +
      evaluation.communicationRating
    ) / 4;
  }

  getRatingCategory(rating: number): string {
    if (rating >= 4.5) return 'excellent';
    if (rating >= 3.5) return 'good';
    if (rating >= 2.5) return 'average';
    return 'poor';
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

  getStarArray(rating: number): number[] {
    return Array(5).fill(0).map((_, i) => i + 1);
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  deleteEvaluation(evaluation: Evaluation): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette évaluation ?')) {
      const reservation = this.getReservation(evaluation.reservationId);
      this.evaluationService.deleteEvaluation(evaluation.id!).subscribe({
        next: () => {
          this.snackBar.open('Évaluation supprimée avec succès', 'Fermer', { duration: 3000 });
          
          // Ajouter une notification
          this.notificationService.notifyEvaluationDeleted(evaluation.id!);
          
          this.loadAllEvaluations();
        },
        error: (error) => {
          console.error('Erreur lors de la suppression:', error);
          this.snackBar.open('Erreur lors de la suppression', 'Fermer', { duration: 3000 });
        }
      });
    }
  }

  refreshData(): void {
    this.loadAllEvaluations();
  }

  exportEvaluations(): void {
    const csvData = this.filteredEvaluations.map(evaluation => {
      const reservation = this.getReservation(evaluation.reservationId);
      return {
        'ID': evaluation.id,
        'Client': reservation?.clientName || 'N/A',
        'Consultant': reservation?.consultantName || 'N/A',
        'Réservation': `#${evaluation.reservationId}`,
        'Note Générale': evaluation.generalRating,
        'Qualité Service': evaluation.serviceQualityRating,
        'Ponctualité': evaluation.punctualityRating,
        'Communication': evaluation.communicationRating,
        'Moyenne': this.getEvaluationAverage(evaluation).toFixed(1),
        'Commentaire': evaluation.comment || '',
        'Date': this.formatDate(evaluation.createdAt || '')
      };
    });

    // Convert to CSV
    const headers = Object.keys(csvData[0] || {});
    const csvContent = [
      headers.join(','),
      ...csvData.map(row => headers.map(header => `"${(row as any)[header] || ''}"`).join(','))
    ].join('\n');

    // Download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `evaluations_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    this.snackBar.open('Export CSV téléchargé', 'Fermer', { duration: 3000 });
  }

  // Méthodes de pagination
  updatePagination(): void {
    this.paginationConfig.totalItems = this.filteredEvaluations.length;
    this.updatePaginatedEvaluations();
  }

  updatePaginatedEvaluations(): void {
    const startIndex = (this.paginationConfig.currentPage - 1) * this.paginationConfig.itemsPerPage;
    const endIndex = startIndex + this.paginationConfig.itemsPerPage;
    this.paginatedEvaluations = this.filteredEvaluations.slice(startIndex, endIndex);
  }

  onPageChange(page: number): void {
    this.paginationConfig.currentPage = page;
    this.updatePaginatedEvaluations();
  }

  onPageSizeChange(pageSize: number): void {
    this.paginationConfig.itemsPerPage = pageSize;
    this.paginationConfig.currentPage = 1; // Réinitialiser à la première page
    this.updatePagination();
  }
}
