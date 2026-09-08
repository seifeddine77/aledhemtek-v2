import { Component, OnInit, inject } from '@angular/core';
import { ConsultantService } from '../../services/consultant.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { ConsultantInterface } from '../../models/consultant-interface';
import { MatIcon } from '@angular/material/icon';
import { MatTooltip } from '@angular/material/tooltip';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { PaginationComponent, PaginationConfig } from '../shared/pagination/pagination.component';
import { CleanTextPipe } from '../../pipes/clean-text.pipe';
import { ConsultantDossierDialogComponent } from '../dialogs/consultant-dossier-dialog/consultant-dossier-dialog.component';

@Component({
  selector: 'app-manage-consultants',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatTableModule,
    MatButtonModule,
    MatIcon,
    MatTooltip,
    MatCardModule,
    MatChipsModule,
    MatSelectModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatDialogModule,
    PaginationComponent,
    CleanTextPipe
  ],
  templateUrl: './manage-consultants.component.html',
  styleUrls: ['./manage-consultants.component.css']
})
export class ManageConsultantsComponent implements OnInit {
  consultantService = inject(ConsultantService);
  snackBar = inject(MatSnackBar);
  dialog = inject(MatDialog);
  
  consultants: ConsultantInterface[] = [];
  filteredConsultants: ConsultantInterface[] = [];
  paginatedConsultants: ConsultantInterface[] = [];
  
  displayedColumns = ['id', 'name', 'profession', 'experience', 'company', 'status', 'resume', 'actions'];
  loading = false;
  searchTerm = '';
  statusFilter = 'ALL';

  stats = {
    total: 0,
    approved: 0,
    pending: 0,
    rejected: 0
  };

  paginationConfig: PaginationConfig = {
    currentPage: 1,
    totalItems: 0,
    itemsPerPage: 10,
    pageSizeOptions: [5, 10, 25, 50]
  };

  ngOnInit(): void {
    this.fetchAll();
  }

  fetchAll(): void {
    this.loading = true;
    this.consultantService.getAll().subscribe({
      next: (data) => {
        this.consultants = data || [];
        this.calculateStats();
        this.applyFilter();
        this.loading = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des consultants:', error);
        this.snackBar.open('Erreur lors du chargement des consultants', 'Fermer', { duration: 3000 });
        this.loading = false;
      }
    });
  }

  calculateStats(): void {
    this.stats.total = this.consultants.length;
    this.stats.approved = this.consultants.filter(c => c.status === 'APPROVED').length;
    this.stats.pending = this.consultants.filter(c => c.status === 'PENDING' || !c.status).length;
    this.stats.rejected = this.consultants.filter(c => c.status === 'REJECTED').length;
  }

  applyFilter(): void {
    const term = this.searchTerm.toLowerCase().trim();
    this.filteredConsultants = this.consultants.filter(c => {
      const fullName = `${c.firstName || ''} ${c.lastName || ''}`.toLowerCase();
      const matchesSearch = !term ||
        fullName.includes(term) ||
        (c.email && c.email.toLowerCase().includes(term)) ||
        (c.profession && c.profession.toLowerCase().includes(term)) ||
        (c.companyName && c.companyName.toLowerCase().includes(term));

      const matchesStatus = this.statusFilter === 'ALL' ||
        (this.statusFilter === 'PENDING' && (c.status === 'PENDING' || !c.status)) ||
        c.status === this.statusFilter;

      return matchesSearch && matchesStatus;
    });

    this.paginationConfig.currentPage = 1;
    this.updatePagination();
  }

  updatePagination(): void {
    this.paginationConfig.totalItems = this.filteredConsultants.length;
    this.updatePaginatedConsultants();
  }

  updatePaginatedConsultants(): void {
    const startIndex = (this.paginationConfig.currentPage - 1) * this.paginationConfig.itemsPerPage;
    const endIndex = startIndex + this.paginationConfig.itemsPerPage;
    this.paginatedConsultants = this.filteredConsultants.slice(startIndex, endIndex);
  }

  onPageChange(page: number): void {
    this.paginationConfig.currentPage = page;
    this.updatePaginatedConsultants();
  }

  onPageSizeChange(pageSize: number): void {
    this.paginationConfig.itemsPerPage = pageSize;
    this.paginationConfig.currentPage = 1;
    this.updatePagination();
  }

  approve(consultant: ConsultantInterface): void {
    this.loading = true;
    this.consultantService.approve(consultant.id!).subscribe({
      next: () => {
        this.snackBar.open(`Artisan ${consultant.firstName} ${consultant.lastName} agréé avec succès`, 'Fermer', { duration: 3000 });
        this.fetchAll();
      },
      error: () => {
        this.snackBar.open('Erreur lors de l\'approbation de l\'artisan', 'Fermer', { duration: 3000 });
        this.loading = false;
      }
    });
  }

  reject(consultant: ConsultantInterface): void {
    this.loading = true;
    this.consultantService.reject(consultant.id!).subscribe({
      next: () => {
        this.snackBar.open(`Dossier de ${consultant.firstName} ${consultant.lastName} refusé`, 'Fermer', { duration: 3000 });
        this.fetchAll();
      },
      error: () => {
        this.snackBar.open('Erreur lors du rejet du dossier', 'Fermer', { duration: 3000 });
        this.loading = false;
      }
    });
  }

  viewResume(consultant: ConsultantInterface): void {
    if (consultant.id) {
      this.consultantService.downloadResume(String(consultant.id)).subscribe({
        next: (blob) => {
          const url = window.URL.createObjectURL(blob);
          window.open(url, '_blank');
        },
        error: () => {
          this.snackBar.open('Document introuvable ou indisponible', 'Fermer', { duration: 3000 });
        }
      });
    }
  }

  getStatusText(status: string | undefined): string {
    switch (status) {
      case 'APPROVED': return 'Agréé & Vérifié';
      case 'REJECTED': return 'Refusé';
      case 'PENDING':
      default: return 'En attente d\'audit';
    }
  }

  openConsultantDossier(consultant: ConsultantInterface): void {
    const dialogRef = this.dialog.open(ConsultantDossierDialogComponent, {
      width: '800px',
      maxWidth: '95vw',
      data: { consultant }
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result?.action === 'approve') {
        this.approve(result.consultant);
      } else if (result?.action === 'reject') {
        this.reject(result.consultant);
      }
    });
  }
}
