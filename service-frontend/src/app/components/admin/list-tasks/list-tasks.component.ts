import { Component, OnInit } from '@angular/core';
import { AdminService } from '../../../services/admin.service';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { forkJoin } from 'rxjs';
import { AddTaskDialogComponent } from '../add-task-dialog/add-task-dialog.component';

@Component({
  selector: 'app-list-tasks',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatButtonModule,
    MatTableModule,
    MatIconModule,
    MatTooltipModule
  ],
  templateUrl: './list-tasks.component.html'
})
export class ListTasksComponent implements OnInit {

  tasks: any[] = [];
  services: any[] = [];
  displayedColumns: string[] = ['name', 'description', 'serviceName', 'actions'];

  constructor(private adminService: AdminService, public dialog: MatDialog) { }

  ngOnInit(): void {
    this.loadTasksAndServices();
  }

  loadTasksAndServices(): void {
    forkJoin({
      tasks: this.adminService.getAllTasks(),
      services: this.adminService.getAllServices()
    }).subscribe(({ tasks, services }) => {
      this.services = services;
      this.tasks = tasks.map((task: any) => ({
        ...task,
        serviceName: services.find((s: any) => s.id === task.serviceId)?.name || 'N/A'
      }));
    });
  }

  openAddTaskDialog(): void {
    const dialogRef = this.dialog.open(AddTaskDialogComponent, {
      width: '500px',
      data: { services: this.services }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadTasksAndServices();
      }
    });
  }
}
