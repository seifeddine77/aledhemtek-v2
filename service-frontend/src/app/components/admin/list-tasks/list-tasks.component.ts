import { Component, OnInit } from '@angular/core';
import { AdminService } from '../../../services/admin.service';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { forkJoin } from 'rxjs';
import { AddTaskDialogComponent } from '../add-task-dialog/add-task-dialog.component';
import { EditTaskDialogComponent } from '../service/edit-task-dialog.component';
import { PaginationComponent, PaginationConfig } from '../../shared/pagination/pagination.component';

@Component({
  selector: 'app-list-tasks',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    MatButtonModule,
    MatTableModule,
    MatIconModule,
    MatTooltipModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    PaginationComponent
  ],
  templateUrl: './list-tasks.component.html',
  styleUrls: ['./list-tasks.component.css']
})
export class ListTasksComponent implements OnInit {

  tasks: any[] = [];
  services: any[] = [];
  filteredTasks: any[] = [];
  paginatedTasks: any[] = [];
  
  searchTerm: string = '';
  selectedServiceId: number | null = null;
  loading: boolean = false;

  displayedColumns: string[] = ['name', 'description', 'serviceName', 'duration', 'actions'];

  paginationConfig: PaginationConfig = {
    currentPage: 1,
    totalItems: 0,
    itemsPerPage: 10,
    pageSizeOptions: [5, 10, 25, 50]
  };

  constructor(private adminService: AdminService, public dialog: MatDialog) { }

  ngOnInit(): void {
    this.loadTasksAndServices();
  }

  loadTasksAndServices(): void {
    this.loading = true;
    forkJoin({
      tasks: this.adminService.getAllTasks(),
      services: this.adminService.getAllServices()
    }).subscribe({
      next: ({ tasks, services }) => {
        this.services = services || [];
        this.tasks = (tasks || []).map((task: any) => ({
          ...task,
          serviceName: this.services.find((s: any) => s.id === task.serviceId)?.name || 'Général'
        }));
        this.applyFilter();
        this.loading = false;
      },
      error: (err) => {
        console.error('Erreur chargement tâches et services:', err);
        this.loading = false;
      }
    });
  }

  applyFilter(): void {
    const term = this.searchTerm.toLowerCase().trim();
    this.filteredTasks = this.tasks.filter(task => {
      const matchesSearch = !term ||
        (task.name && task.name.toLowerCase().includes(term)) ||
        (task.description && task.description.toLowerCase().includes(term)) ||
        (task.serviceName && task.serviceName.toLowerCase().includes(term));
      
      const matchesService = !this.selectedServiceId || task.serviceId === this.selectedServiceId;
      return matchesSearch && matchesService;
    });

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

  openAddTaskDialog(): void {
    const dialogRef = this.dialog.open(AddTaskDialogComponent, {
      width: '540px',
      data: { services: this.services }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadTasksAndServices();
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
          this.loadTasksAndServices();
        });
      }
    });
  }

  deleteTask(taskId: number): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette tâche ?')) {
      this.adminService.deleteTask(taskId).subscribe(() => {
        this.loadTasksAndServices();
      });
    }
  }
}
