import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Task } from '../../../models/task.model';
import { Reservation } from '../../../models/reservation.model';
import { TaskService } from '../../../services/task.service';
import { ReservationService } from '../../../services/reservation.service';

interface TaskWithQuantity extends Task {
  quantity: number;
  isSelected: boolean;
}

@Component({
  selector: 'app-reservation-task-editor',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatTableModule,
    MatIconModule,
    MatDividerModule,
    MatCardModule,
    MatChipsModule,
    MatSelectModule,
    MatCheckboxModule
  ],
  templateUrl: './reservation-task-editor.component.html',
  styleUrls: ['./reservation-task-editor.component.css']
})
export class ReservationTaskEditorComponent implements OnInit {
  reservation: Reservation;
  availableTasks: TaskWithQuantity[] = [];
  selectedTasks: TaskWithQuantity[] = [];
  loading = false;

  displayedColumns: string[] = ['select', 'name', 'description', 'duration', 'quantity', 'actions'];

  constructor(
    public dialogRef: MatDialogRef<ReservationTaskEditorComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { reservation: Reservation },
    private taskService: TaskService,
    private reservationService: ReservationService,
    private snackBar: MatSnackBar
  ) {
    this.reservation = data.reservation;
  }

  ngOnInit(): void {
    this.loadAvailableTasks();
    this.initializeSelectedTasks();
  }

  loadAvailableTasks(): void {
    this.loading = true;
    this.taskService.getAllTasks().subscribe({
      next: (tasks) => {
        this.availableTasks = tasks.map(task => ({
          ...task,
          quantity: 1,
          isSelected: false
        }));
        this.initializeSelectedTasks();
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading tasks:', error);
        this.loading = false;
      }
    });
  }

  initializeSelectedTasks(): void {
    if (this.reservation.tasks && this.reservation.tasks.length > 0) {
      this.selectedTasks = this.reservation.tasks.map(task => ({
        ...task,
        quantity: (task as any).quantity || 1, // Cast temporaire pour éviter l'erreur TypeScript
        isSelected: true
      }));

      // Marquer les tâches comme sélectionnées dans la liste disponible
      this.availableTasks.forEach(availableTask => {
        const selectedTask = this.selectedTasks.find(st => st.id === availableTask.id);
        if (selectedTask) {
          availableTask.isSelected = true;
          availableTask.quantity = selectedTask.quantity;
        }
      });
    }
  }

  toggleTaskSelection(task: TaskWithQuantity): void {
    task.isSelected = !task.isSelected;
    
    if (task.isSelected) {
      // Ajouter à la liste des tâches sélectionnées
      const taskCopy = { ...task };
      this.selectedTasks.push(taskCopy);
    } else {
      // Supprimer de la liste des tâches sélectionnées
      this.selectedTasks = this.selectedTasks.filter(st => st.id !== task.id);
    }
  }

  onQuantityChange(task: TaskWithQuantity, event: Event): void {
    const target = event.target as HTMLInputElement;
    const quantity = parseInt(target.value, 10);
    this.updateQuantity(task, quantity);
  }

  updateQuantity(task: TaskWithQuantity, quantity: number): void {
    if (quantity < 1) {
      quantity = 1;
    }
    
    task.quantity = quantity;
    
    // Mettre à jour aussi dans la liste des tâches sélectionnées
    const selectedTask = this.selectedTasks.find(st => st.id === task.id);
    if (selectedTask) {
      selectedTask.quantity = quantity;
    }
  }

  removeTask(task: TaskWithQuantity): void {
    // Supprimer de la liste des tâches sélectionnées
    this.selectedTasks = this.selectedTasks.filter(st => st.id !== task.id);
    
    // Démarquer dans la liste disponible
    const availableTask = this.availableTasks.find(at => at.id === task.id);
    if (availableTask) {
      availableTask.isSelected = false;
      availableTask.quantity = 1;
    }
  }

  onSave(): void {
    this.loading = true;
    
    // Préparer les données pour l'API
    const taskIds = this.selectedTasks.map(task => task.id!);
    const taskQuantities: { [key: string]: number } = {};
    
    this.selectedTasks.forEach(task => {
      taskQuantities[task.id!.toString()] = task.quantity;
    });

    // D'abord, supprimer toutes les tâches existantes
    const existingTaskIds = this.reservation.tasks?.map(t => t.id!) || [];
    const tasksToRemove = existingTaskIds.filter(id => !taskIds.includes(id));
    
    // Supprimer les tâches qui ne sont plus sélectionnées
    const removePromises = tasksToRemove.map(taskId => 
      this.reservationService.removeTaskFromReservation(this.reservation.id!, taskId).toPromise()
    );

    Promise.all(removePromises).then(() => {
      // Ajouter les nouvelles tâches
      if (taskIds.length > 0) {
        this.reservationService.addTasksToReservation(this.reservation.id!, taskIds, taskQuantities).subscribe({
          next: (updatedReservation) => {
            this.loading = false;
            this.snackBar.open('Tâches mises à jour avec succès', 'Fermer', { duration: 3000 });
            this.dialogRef.close(updatedReservation);
          },
          error: (error) => {
            console.error('Error updating tasks:', error);
            this.loading = false;
            this.snackBar.open('Erreur lors de la mise à jour des tâches', 'Fermer', { duration: 3000 });
          }
        });
      } else {
        this.loading = false;
        this.snackBar.open('Tâches mises à jour avec succès', 'Fermer', { duration: 3000 });
        this.dialogRef.close();
      }
    }).catch(error => {
      console.error('Error removing tasks:', error);
      this.loading = false;
      this.snackBar.open('Erreur lors de la suppression des tâches', 'Fermer', { duration: 3000 });
    });
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  formatDuration(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    
    if (hours > 0) {
      return `${hours}h ${mins}min`;
    }
    return `${mins}min`;
  }
}
