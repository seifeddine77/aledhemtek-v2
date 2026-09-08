import { Component, OnInit } from '@angular/core';
import { AdminService } from '../../../services/admin.service';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatTooltipModule } from '@angular/material/tooltip';
import { forkJoin } from 'rxjs';
import { AddServiceDialogComponent } from '../add-service-dialog/add-service-dialog.component';
import { EditTaskDialogComponent } from '../service/edit-task-dialog.component';
import { PaginationComponent, PaginationConfig } from '../../shared/pagination/pagination.component';

@Component({
  selector: 'app-list-services-tasks',
  standalone: true,
  imports: [
    CommonModule, 
    RouterModule, 
    FormsModule,
    MatButtonModule, 
    MatIconModule,
    MatCardModule,
    MatTooltipModule,
    PaginationComponent
  ],
  templateUrl: './list-services-tasks.component.html',
  styleUrls: ['./list-services-tasks.component.css']
})
export class ListServicesTasksComponent implements OnInit {

  services: any[] = [];
  filteredServices: any[] = [];
  paginatedServices: any[] = [];
  
  searchTerm: string = '';
  loading: boolean = false;

  paginationConfig: PaginationConfig = {
    currentPage: 1,
    totalItems: 0,
    itemsPerPage: 5,
    pageSizeOptions: [3, 5, 10, 20]
  };

  constructor(private adminService: AdminService, public dialog: MatDialog) { }

  ngOnInit(): void {
    this.loadServicesAndTasks();
  }

  loadServicesAndTasks(): void {
    this.loading = true;
    forkJoin({
      services: this.adminService.getAllServices(),
      tasks: this.adminService.getAllTasks()
    }).subscribe({
      next: ({ services, tasks }) => {
        this.services = (services || []).map((service: any) => ({
          ...service,
          tasks: (tasks || []).filter((task: any) => task.serviceId === service.id)
        }));
        this.applyFilter();
        this.loading = false;
      },
      error: (err) => {
        console.error('Erreur chargement services et tâches:', err);
        this.loading = false;
      }
    });
  }

  applyFilter(): void {
    const term = this.searchTerm.toLowerCase().trim();
    if (!term) {
      this.filteredServices = [...this.services];
    } else {
      this.filteredServices = this.services.filter(s => 
        (s.name && s.name.toLowerCase().includes(term)) ||
        (s.description && s.description.toLowerCase().includes(term)) ||
        (s.tasks && s.tasks.some((t: any) => 
          (t.name && t.name.toLowerCase().includes(term)) ||
          (t.description && t.description.toLowerCase().includes(term))
        ))
      );
    }
    this.paginationConfig.currentPage = 1;
    this.updatePagination();
  }

  updatePagination(): void {
    this.paginationConfig.totalItems = this.filteredServices.length;
    this.updatePaginatedServices();
  }

  updatePaginatedServices(): void {
    const start = (this.paginationConfig.currentPage - 1) * this.paginationConfig.itemsPerPage;
    const end = start + this.paginationConfig.itemsPerPage;
    this.paginatedServices = this.filteredServices.slice(start, end);
  }

  onPageChange(page: number): void {
    this.paginationConfig.currentPage = page;
    this.updatePaginatedServices();
  }

  onPageSizeChange(size: number): void {
    this.paginationConfig.itemsPerPage = size;
    this.paginationConfig.currentPage = 1;
    this.updatePagination();
  }

  openAddServiceDialog(): void {
    const dialogRef = this.dialog.open(AddServiceDialogComponent, {
      width: '540px',
      data: {}
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadServicesAndTasks();
      }
    });
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
        price: (task.rates && task.rates.length > 0) ? task.rates[0].price : 0
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.adminService.updateTask(result.id, result).subscribe(() => {
          this.loadServicesAndTasks();
        });
      }
    });
  }

  deleteTask(taskId: number): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette tâche ?')) {
      this.adminService.deleteTask(taskId).subscribe(() => {
        this.loadServicesAndTasks();
      });
    }
  }
}
