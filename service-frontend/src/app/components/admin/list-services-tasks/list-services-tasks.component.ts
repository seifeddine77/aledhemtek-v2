import { Component, OnInit } from '@angular/core';
import { AdminService } from '../../../services/admin.service';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { forkJoin } from 'rxjs';
import { AddServiceDialogComponent } from '../add-service-dialog/add-service-dialog.component';

@Component({
  selector: 'app-list-services-tasks',
  standalone: true,
  imports: [CommonModule, RouterModule, MatButtonModule, MatIconModule],
  templateUrl: './list-services-tasks.component.html',
  styleUrls: ['./list-services-tasks.component.css']
})
export class ListServicesTasksComponent implements OnInit {

  services: any[] = [];

  constructor(private adminService: AdminService, public dialog: MatDialog) { }

  ngOnInit(): void {
    this.loadServicesAndTasks();
  }

  loadServicesAndTasks(): void {
    forkJoin({
      services: this.adminService.getAllServices(),
      tasks: this.adminService.getAllTasks()
    }).subscribe(({ services, tasks }) => {
      this.services = services.map((service: any) => ({
        ...service,
        tasks: tasks.filter((task: any) => task.serviceId === service.id)
      }));
    });
  }

  openAddServiceDialog(): void {
    const dialogRef = this.dialog.open(AddServiceDialogComponent, {
      width: '500px',
      data: {}
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadServicesAndTasks();
      }
    });
  }
}
