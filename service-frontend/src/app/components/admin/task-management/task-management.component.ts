import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatMenuModule } from '@angular/material/menu';
import { TaskService, TaskDto } from '../../../services/task.service';
import { AdminService } from '../../../services/admin.service';
import { TaskEditDialogComponent } from '../task-edit-dialog/task-edit-dialog.component';
import { RouterModule } from '@angular/router';
import { PaginationComponent, PaginationConfig } from '../../shared/pagination/pagination.component';

@Component({
  selector: 'app-task-management',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatCardModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatMenuModule,
    RouterModule,
    PaginationComponent
  ],
  templateUrl: './task-management.component.html',
  styleUrls: ['./task-management.component.css']
})
export class TaskManagementComponent implements OnInit {

  tasks: TaskDto[] = [];
  services: any[] = [];
  filteredTasks: TaskDto[] = [];
  searchKeyword: string = '';
  selectedServiceId: number | null = null;
  loading = false;

  displayedColumns: string[] = ['image', 'name', 'service', 'duration', 'price', 'materials', 'actions'];

  // Statistics
  stats = {
    totalTasks: 0,
    averagePrice: 0,
    averageDuration: 0,
    totalServices: 0
  };

  // Pagination
  paginationConfig: PaginationConfig = {
    currentPage: 1,
    totalItems: 0,
    itemsPerPage: 10,
    pageSizeOptions: [5, 10, 25, 50]
  };
  
  paginatedTasks: TaskDto[] = [];

  constructor(
    private taskService: TaskService,
    private adminService: AdminService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadTasks();
    this.loadServices();
  }

  loadTasks(): void {
    this.loading = true;
    this.taskService.getAllTasks().subscribe({
      next: (tasks) => {
        this.tasks = tasks;
        this.filteredTasks = tasks;
        this.updatePagination();
        this.calculateStatistics();
        this.loading = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des tâches:', error);
        this.showError('Erreur lors du chargement des tâches');
        this.loading = false;
      }
    });
  }

  loadServices(): void {
    this.adminService.getAllServices().subscribe({
      next: (services) => {
        this.services = services;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des services:', error);
      }
    });
  }

  filterTasks(): void {
    this.filteredTasks = this.tasks.filter(task => {
      const matchesKeyword = !this.searchKeyword || 
        task.name.toLowerCase().includes(this.searchKeyword.toLowerCase()) ||
        (task.description && task.description.toLowerCase().includes(this.searchKeyword.toLowerCase()));
      
      const matchesService = !this.selectedServiceId || task.serviceId === this.selectedServiceId;
      
      return matchesKeyword && matchesService;
    });
    
    // Réinitialiser à la première page après filtrage
    this.paginationConfig.currentPage = 1;
    this.updatePagination();
  }

  onSearchChange(): void {
    this.filterTasks();
  }

  onServiceFilterChange(): void {
    this.filterTasks();
  }

  clearFilters(): void {
    this.searchKeyword = '';
    this.selectedServiceId = null;
    this.filteredTasks = this.tasks;
  }

  getServiceName(serviceId: number): string {
    const service = this.services.find(s => s.id === serviceId);
    return service ? service.name : 'Service inconnu';
  }

  getTaskPrice(task: TaskDto): string {
    if (task.rates && task.rates.length > 0) {
      const prices = task.rates.map(rate => rate.price);
      const minPrice = Math.min(...prices);
      const maxPrice = Math.max(...prices);
      
      if (minPrice === maxPrice) {
        return `${minPrice}€`;
      } else {
        return `${minPrice}€ - ${maxPrice}€`;
      }
    }
    return 'Prix non défini';
  }

  getMaterialsCount(task: TaskDto): number {
    return task.materials ? task.materials.length : 0;
  }

  editTask(task: TaskDto): void {
    const dialogRef = this.dialog.open(TaskEditDialogComponent, {
      width: '500px',
      data: { task: task }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // Recharger la liste des tâches après modification
        this.loadTasks();
      }
    });
  }

  viewTaskDetails(task: TaskDto): void {
    // TODO: Ouvrir dialog de détails
    console.log('Voir détails de la tâche:', task);
  }

  deleteTask(task: TaskDto): void {
    if (confirm(`Êtes-vous sûr de vouloir supprimer la tâche "${task.name}" ?`)) {
      this.loading = true;
      this.taskService.deleteTask(task.id!).subscribe({
        next: () => {
          this.snackBar.open('Tâche supprimée avec succès', 'Fermer', {
            duration: 3000
          });
          this.loadTasks(); // Recharger la liste
        },
        error: (error) => {
          console.error('Erreur lors de la suppression:', error);
          this.snackBar.open('Erreur lors de la suppression', 'Fermer', {
            duration: 3000
          });
          this.loading = false;
        }
      });
    }
  }

  duplicateTask(task: TaskDto): void {
    const duplicatedTask: TaskDto = {
      ...task,
      id: undefined,
      name: `${task.name} (Copie)`,
      imageName: undefined
    };
    
    // TODO: Ouvrir dialog de création avec les données pré-remplies
    console.log('Dupliquer la tâche:', duplicatedTask);
  }

  exportTasks(): void {
    // Créer les données CSV
    const csvData = this.filteredTasks.map(task => ({
      'Nom': task.name,
      'Description': task.description || '',
      'Service': this.getServiceName(task.serviceId),
      'Durée (min)': task.duration || 0,
      'Prix': this.getTaskPrice(task),
      'Matériaux': this.getMaterialsCount(task)
    }));

    // Convertir en CSV
    const headers = Object.keys(csvData[0]);
    const csvContent = [
      headers.join(','),
      ...csvData.map(row => headers.map(header => `"${(row as any)[header]}"`).join(','))
    ].join('\n');

    // Télécharger le fichier
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `taches_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    this.showSuccess('Export des tâches réussi !');
  }

  getImageUrl(imageName: string | undefined): string {
    if (imageName) {
      // Enlever le préfixe 'tasks/' s'il existe déjà (pour compatibilité avec anciennes données)
      const cleanImageName = imageName.startsWith('tasks/') ? imageName.substring(6) : imageName;
      return `http://localhost:8080/uploads/tasks/${cleanImageName}`;
    }
    return 'assets/images/default-task.png';
  }

  private calculateStatistics(): void {
    this.stats.totalTasks = this.tasks.length;
    this.stats.totalServices = new Set(this.tasks.map(t => t.serviceId)).size;
    
    if (this.tasks.length > 0) {
      // Calcul du prix moyen
      const prices = this.tasks.map(task => {
        if (task.rates && task.rates.length > 0) {
          return task.rates.reduce((sum, rate) => sum + rate.price, 0) / task.rates.length;
        }
        return 0;
      });
      this.stats.averagePrice = prices.reduce((sum, price) => sum + price, 0) / prices.length;
      
      // Calcul de la durée moyenne
      this.stats.averageDuration = this.tasks.reduce((sum, task) => sum + task.duration, 0) / this.tasks.length;
    }
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(price);
  }

  formatDuration(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    
    if (hours > 0) {
      return `${hours}h ${mins}min`;
    }
    return `${mins}min`;
  }

  private showSuccess(message: string): void {
    this.snackBar.open(message, 'Fermer', {
      duration: 3000,
      panelClass: ['success-snackbar']
    });
  }

  private showError(message: string): void {
    this.snackBar.open(message, 'Fermer', {
      duration: 5000,
      panelClass: ['error-snackbar']
    });
  }

  // Méthodes de pagination
  updatePagination(): void {
    this.paginationConfig.totalItems = this.filteredTasks.length;
    this.updatePaginatedTasks();
  }

  updatePaginatedTasks(): void {
    const startIndex = (this.paginationConfig.currentPage - 1) * this.paginationConfig.itemsPerPage;
    const endIndex = startIndex + this.paginationConfig.itemsPerPage;
    this.paginatedTasks = this.filteredTasks.slice(startIndex, endIndex);
  }

  onPageChange(page: number): void {
    this.paginationConfig.currentPage = page;
    this.updatePaginatedTasks();
  }

  onPageSizeChange(pageSize: number): void {
    this.paginationConfig.itemsPerPage = pageSize;
    this.paginationConfig.currentPage = 1; // Réinitialiser à la première page
    this.updatePagination();
  }

  refreshData(): void {
    this.loadTasks();
    this.loadServices();
  }
}
