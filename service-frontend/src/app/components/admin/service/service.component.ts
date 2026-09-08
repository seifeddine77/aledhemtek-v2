import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';

import { CommonModule } from '@angular/common';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterModule } from '@angular/router';

import { AddCategoryDialogComponent, AddCategoryData } from './add-category-dialog.component';
import { EditTaskDialogComponent } from './edit-task-dialog.component';
import { ManageMaterialsDialogComponent } from './manage-materials-dialog.component';
import { AdminService } from '../../../services/admin.service';

import { PaginationComponent, PaginationConfig } from '../../shared/pagination/pagination.component';
import { CleanTextPipe } from '../../../pipes/clean-text.pipe';

@Component({
  selector: 'app-service',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatCardModule,
    MatTooltipModule,
    RouterModule,
    MatTableModule,
    PaginationComponent,
    CleanTextPipe
  ],
  templateUrl: './service.component.html',
  styleUrls: ['./service.component.css']
})
export class ServiceComponent implements OnInit {

  allTasks: any[] = [];
  filteredTasks: any[] = [];
  paginatedTasks: any[] = [];
  searchTerm: string = '';
  loading = false;

  stats = {
    totalTasks: 0,
    avgDuration: 0,
    avgPrice: 0
  };

  paginationConfig: PaginationConfig = {
    currentPage: 1,
    totalItems: 0,
    itemsPerPage: 10,
    pageSizeOptions: [5, 10, 25, 50]
  };

  allTasksDisplayedColumns: string[] = ['name', 'description', 'duration', 'price', 'materials', 'actions'];

  constructor(public dialog: MatDialog, private adminService: AdminService) { }

  ngOnInit(): void {
    this.loadAllTasks();
  }

  loadAllTasks(): void {
    this.loading = true;
    this.adminService.getAllTasks().subscribe({
      next: (res) => {
        this.allTasks = res || [];
        this.applyFilter();
        this.calculateStats();
        this.loading = false;
      },
      error: (err) => {
        console.error('Erreur chargement tâches:', err);
        this.loading = false;
      }
    });
  }

  applyFilter(): void {
    const term = this.searchTerm.toLowerCase().trim();
    if (!term) {
      this.filteredTasks = [...this.allTasks];
    } else {
      this.filteredTasks = this.allTasks.filter(t => 
        (t.name && t.name.toLowerCase().includes(term)) ||
        (t.description && t.description.toLowerCase().includes(term))
      );
    }
    this.paginationConfig.currentPage = 1;
    this.updatePagination();
  }

  updatePagination(): void {
    this.paginationConfig.totalItems = this.filteredTasks.length;
    this.updatePaginatedTasks();
  }

  updatePaginatedTasks(): void {
    const start = (this.paginationConfig.currentPage - 1) * this.paginationConfig.itemsPerPage;
    const end = start + this.paginationConfig.itemsPerPage;
    this.paginatedTasks = this.filteredTasks.slice(start, end);
  }

  onPageChange(page: number): void {
    this.paginationConfig.currentPage = page;
    this.updatePaginatedTasks();
  }

  onPageSizeChange(size: number): void {
    this.paginationConfig.itemsPerPage = size;
    this.paginationConfig.currentPage = 1;
    this.updatePagination();
  }

  calculateStats(): void {
    this.stats.totalTasks = this.allTasks.length;
    if (this.allTasks.length > 0) {
      const totalDur = this.allTasks.reduce((sum, t) => sum + (t.duration || 0), 0);
      this.stats.avgDuration = Math.round(totalDur / this.allTasks.length);

      let priceCount = 0;
      let totalPrice = 0;
      this.allTasks.forEach(t => {
        if (t.rates && t.rates.length > 0 && t.rates[0].price) {
          totalPrice += Number(t.rates[0].price);
          priceCount++;
        }
      });
      this.stats.avgPrice = priceCount > 0 ? Math.round((totalPrice / priceCount) * 10) / 10 : 0;
    }
  }

  editTask(task: any): void {
    const dialogRef = this.dialog.open(EditTaskDialogComponent, {
      width: '580px',
      maxWidth: '94vw',
      data: { 
        id: task.id, 
        name: task.name, 
        description: task.description, 
        duration: task.duration,
        // Assurez-vous que le prix est bien extrait, même s'il est dans un tableau
        price: (task.rates && task.rates.length > 0) ? task.rates[0].price : 0
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // Le service d'update n'existe pas encore, nous l'ajouterons plus tard
        this.adminService.updateTask(result.id, result).subscribe(() => {
          console.log('Tâche mise à jour avec succès!');
          this.loadAllTasks(); // Recharger les tâches pour voir les changements
        });
      }
    });
  }

  deleteTask(taskId: number): void {
    this.adminService.deleteTask(taskId).subscribe(() => {
      console.log(`Tâche avec l'ID ${taskId} a été supprimée.`);
      this.loadAllTasks(); // Met à jour le tableau des tâches
    });
  }

  manageMaterials(task: any): void {
    const dialogRef = this.dialog.open(ManageMaterialsDialogComponent, {
      width: '750px',
      data: { taskId: task.id, materials: task.materials },
      panelClass: 'materials-dialog-panel',
      maxWidth: '90vw'
    });

    dialogRef.afterClosed().subscribe(result => {
      // Optionnel : recharger les tâches pour voir les changements
      this.loadAllTasks();
    });
  }

}
