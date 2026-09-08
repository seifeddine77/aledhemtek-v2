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
import { MatTooltipModule } from '@angular/material/tooltip';
import { Task } from '../../../models/task.model';
import { Reservation } from '../../../models/reservation.model';
import { TaskService } from '../../../services/task.service';
import { ReservationService } from '../../../services/reservation.service';
import { CleanTextPipe } from '../../../pipes/clean-text.pipe';

export interface TaskWithQuantity extends Task {
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
    MatCheckboxModule,
    MatTooltipModule,
    CleanTextPipe
  ],
  templateUrl: './reservation-task-editor.component.html',
  styleUrls: ['./reservation-task-editor.component.css']
})
export class ReservationTaskEditorComponent implements OnInit {
  reservation: Reservation;
  availableTasks: TaskWithQuantity[] = [];
  filteredAvailableTasks: TaskWithQuantity[] = [];
  selectedTasks: TaskWithQuantity[] = [];
  loading = false;
  saving = false;
  searchTerm: string = '';

  displayedColumns: string[] = ['name', 'description', 'duration', 'quantity', 'actions'];

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
        this.filterAvailableTasks();
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
        quantity: (task as any).quantity || 1,
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
    this.filterAvailableTasks();
  }

  filterAvailableTasks(): void {
    const term = this.searchTerm.toLowerCase().trim();
    this.filteredAvailableTasks = this.availableTasks.filter(task => {
      const matchesSearch = !term ||
        (task.name && task.name.toLowerCase().includes(term)) ||
        (task.description && task.description.toLowerCase().includes(term));
      return matchesSearch;
    });
  }

  onSearchChange(): void {
    this.filterAvailableTasks();
  }

  isTaskSelected(task: TaskWithQuantity): boolean {
    return this.selectedTasks.some(st => st.id === task.id);
  }

  toggleTaskSelection(task: TaskWithQuantity): void {
    const index = this.selectedTasks.findIndex(st => st.id === task.id);
    if (index !== -1) {
      this.selectedTasks.splice(index, 1);
      task.isSelected = false;
    } else {
      const taskCopy = { ...task, isSelected: true, quantity: task.quantity || 1 };
      this.selectedTasks.push(taskCopy);
      task.isSelected = true;
    }
  }

  addTask(task: TaskWithQuantity): void {
    if (!this.isTaskSelected(task)) {
      this.toggleTaskSelection(task);
    }
  }

  removeTask(task: TaskWithQuantity): void {
    this.selectedTasks = this.selectedTasks.filter(st => st.id !== task.id);
    const availableTask = this.availableTasks.find(at => at.id === task.id);
    if (availableTask) {
      availableTask.isSelected = false;
      availableTask.quantity = 1;
    }
  }

  incrementQty(task: TaskWithQuantity): void {
    task.quantity = (task.quantity || 1) + 1;
    const selected = this.selectedTasks.find(st => st.id === task.id);
    if (selected) selected.quantity = task.quantity;
  }

  decrementQty(task: TaskWithQuantity): void {
    if ((task.quantity || 1) > 1) {
      task.quantity = (task.quantity || 1) - 1;
      const selected = this.selectedTasks.find(st => st.id === task.id);
      if (selected) selected.quantity = task.quantity;
    }
  }

  onQuantityChange(task: TaskWithQuantity, event: Event): void {
    const target = event.target as HTMLInputElement;
    const qty = parseInt(target.value, 10);
    const val = isNaN(qty) || qty < 1 ? 1 : qty;
    task.quantity = val;
    const selected = this.selectedTasks.find(st => st.id === task.id);
    if (selected) selected.quantity = val;
  }

  getTotalEstimatedDuration(): number {
    return this.selectedTasks.reduce((sum, task) => sum + ((task.duration || 0) * (task.quantity || 1)), 0);
  }

  formatDuration(minutes: number): string {
    const rounded = Math.round(minutes || 0);
    const hours = Math.floor(rounded / 60);
    const mins = rounded % 60;
    if (hours > 0) {
      return mins > 0 ? `${hours}h ${mins}min` : `${hours}h`;
    }
    return `${mins}min`;
  }

  onSave(): void {
    this.saving = true;
    const taskIds = this.selectedTasks.map(task => task.id!);
    const taskQuantities: { [key: string]: number } = {};

    this.selectedTasks.forEach(task => {
      taskQuantities[task.id!.toString()] = task.quantity;
    });

    const existingTaskIds = this.reservation.tasks?.map(t => t.id!) || [];
    const tasksToRemove = existingTaskIds.filter(id => !taskIds.includes(id));

    const removePromises = tasksToRemove.map(taskId =>
      this.reservationService.removeTaskFromReservation(this.reservation.id!, taskId).toPromise()
    );

    Promise.all(removePromises).then(() => {
      if (taskIds.length > 0) {
        this.reservationService.addTasksToReservation(this.reservation.id!, taskIds, taskQuantities).subscribe({
          next: (updatedReservation) => {
            this.saving = false;
            this.snackBar.open('Prestations de la mission enregistrées avec succès', 'Fermer', { duration: 3000 });
            this.dialogRef.close(updatedReservation);
          },
          error: (error) => {
            console.error('Error updating tasks:', error);
            this.saving = false;
            this.snackBar.open('Erreur lors de la mise à jour des tâches', 'Fermer', { duration: 3000 });
          }
        });
      } else {
        this.saving = false;
        this.snackBar.open('Prestations de la mission enregistrées avec succès', 'Fermer', { duration: 3000 });
        this.dialogRef.close();
      }
    }).catch(error => {
      console.error('Error removing tasks:', error);
      this.saving = false;
      this.snackBar.open('Erreur lors de la suppression des tâches', 'Fermer', { duration: 3000 });
    });
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
