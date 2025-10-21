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
  ],
  templateUrl: './service.component.html',
  styleUrls: ['./service.component.css']
})
export class ServiceComponent implements OnInit {

  // Propriétés pour le tableau de toutes les tâches
  allTasksDataSource = new MatTableDataSource<any>();
  allTasksDisplayedColumns: string[] = ['name', 'description', 'duration', 'price', 'actions'];

  constructor(public dialog: MatDialog, private adminService: AdminService) { }

  ngOnInit(): void {
    this.loadAllTasks();
  }

  loadAllTasks(): void {
    this.adminService.getAllTasks().subscribe(res => {
      this.allTasksDataSource.data = res;
    });
  }

  editTask(task: any): void {
    const dialogRef = this.dialog.open(EditTaskDialogComponent, {
      width: '400px',
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
