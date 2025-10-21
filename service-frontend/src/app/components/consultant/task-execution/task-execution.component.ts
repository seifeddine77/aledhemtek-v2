import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatMenuModule } from '@angular/material/menu';
import { ReservationService } from '../../../services/reservation.service';
import { TaskService } from '../../../services/task.service';
import { AuthService } from '../../../services/auth.service';
import { Reservation, ReservationStatus } from '../../../models/reservation.model';
import { Task } from '../../../models/task.model';

interface TaskExecution {
  id?: number;
  taskId: number;
  reservationId: number;
  task: Task;
  reservation: Reservation;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  startedAt?: Date;
  completedAt?: Date;
  notes?: string;
  timeSpent?: number;
  materialsUsed?: any[];
}

@Component({
  selector: 'app-task-execution',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTabsModule,
    MatChipsModule,
    MatProgressBarModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatExpansionModule,
    MatDividerModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
    MatMenuModule
  ],
  templateUrl: './task-execution.component.html',
  styleUrls: ['./task-execution.component.css']
})
export class TaskExecutionComponent implements OnInit {

  // Data
  assignedReservations: Reservation[] = [];
  pendingTasks: TaskExecution[] = [];
  inProgressTasks: TaskExecution[] = [];
  completedTasks: TaskExecution[] = [];
  
  // State
  loading = false;
  selectedTask: TaskExecution | null = null;
  currentUserId: number | null = null;
  
  // Forms
  taskUpdateForm!: FormGroup;
  notesForm!: FormGroup;
  
  // Statistics
  stats = {
    totalAssigned: 0,
    pending: 0,
    inProgress: 0,
    completed: 0,
    totalTimeSpent: 0,
    averageTaskTime: 0
  };

  constructor(
    private fb: FormBuilder,
    private reservationService: ReservationService,
    private taskService: TaskService,
    private authService: AuthService,
    private snackBar: MatSnackBar
  ) {
    this.initializeForms();
  }

  ngOnInit(): void {
    this.currentUserId = this.authService.getCurrentUserId();
    this.loadAssignedReservations();
  }

  private initializeForms(): void {
    this.taskUpdateForm = this.fb.group({
      status: [''],
      timeSpent: [''],
      notes: ['']
    });

    this.notesForm = this.fb.group({
      notes: ['']
    });
  }

  private loadAssignedReservations(): void {
    if (!this.currentUserId) {
      this.showError('Utilisateur non identifié');
      return;
    }

    this.loading = true;
    
    this.reservationService.getAllReservations().subscribe({
      next: (reservations: Reservation[]) => {
        this.assignedReservations = reservations.filter((r: Reservation) => 
          r.status === ReservationStatus.ASSIGNED || 
          r.status === ReservationStatus.IN_PROGRESS
        );
        this.processTasks();
        this.calculateStatistics();
      },
      error: (error: any) => {
        console.error('Erreur lors du chargement des réservations:', error);
        this.showError('Erreur lors du chargement des réservations');
      },
      complete: () => {
        this.loading = false;
      }
    });
  }

  private processTasks(): void {
    this.pendingTasks = [];
    this.inProgressTasks = [];
    this.completedTasks = [];

    this.assignedReservations.forEach(reservation => {
      if (reservation.tasks) {
        reservation.tasks.forEach(task => {
          const taskExecution: TaskExecution = {
            taskId: task.id!,
            reservationId: reservation.id!,
            task: task,
            reservation: reservation,
            status: this.getTaskStatus(task, reservation),
            notes: task.description
          };

          switch (taskExecution.status) {
            case 'PENDING':
              this.pendingTasks.push(taskExecution);
              break;
            case 'IN_PROGRESS':
              this.inProgressTasks.push(taskExecution);
              break;
            case 'COMPLETED':
              this.completedTasks.push(taskExecution);
              break;
          }
        });
      }
    });
  }

  private getTaskStatus(task: Task, reservation: Reservation): 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' {
    // Logique pour déterminer le statut de la tâche basé sur la réservation
    if (reservation.status === ReservationStatus.COMPLETED) {
      return 'COMPLETED';
    } else if (reservation.status === ReservationStatus.IN_PROGRESS) {
      return 'IN_PROGRESS';
    } else if (reservation.status === ReservationStatus.CANCELLED) {
      return 'CANCELLED';
    }
    return 'PENDING';
  }

  private calculateStatistics(): void {
    this.stats.pending = this.pendingTasks.length;
    this.stats.inProgress = this.inProgressTasks.length;
    this.stats.completed = this.completedTasks.length;
    this.stats.totalAssigned = this.stats.pending + this.stats.inProgress + this.stats.completed;
    
    // Calcul du temps total et moyen (simulé pour l'exemple)
    this.stats.totalTimeSpent = this.completedTasks.reduce((total, task) => 
      total + (task.timeSpent || task.task.duration), 0
    );
    
    if (this.completedTasks.length > 0) {
      this.stats.averageTaskTime = this.stats.totalTimeSpent / this.completedTasks.length;
    }
  }

  // Actions sur les tâches
  startTask(taskExecution: TaskExecution): void {
    this.loading = true;
    
    // Mettre à jour le statut de la réservation si nécessaire
    if (taskExecution.reservation.status === ReservationStatus.ASSIGNED) {
      this.reservationService.updateReservationStatus(
        taskExecution.reservationId, 
        ReservationStatus.IN_PROGRESS
      ).subscribe({
        next: () => {
          taskExecution.status = 'IN_PROGRESS';
          taskExecution.startedAt = new Date();
          this.moveTaskToInProgress(taskExecution);
          this.showSuccess('Tâche démarrée avec succès');
        },
        error: (error) => {
          console.error('Erreur lors du démarrage de la tâche:', error);
          this.showError('Erreur lors du démarrage de la tâche');
        },
        complete: () => {
          this.loading = false;
        }
      });
    }
  }

  completeTask(taskExecution: TaskExecution): void {
    this.selectedTask = taskExecution;
    this.taskUpdateForm.patchValue({
      status: 'COMPLETED',
      timeSpent: taskExecution.task.duration,
      notes: taskExecution.notes || ''
    });
  }

  saveTaskCompletion(): void {
    if (!this.selectedTask) return;

    const formData = this.taskUpdateForm.value;
    this.loading = true;

    // Simuler la sauvegarde de la completion de tâche
    // Dans un vrai projet, cela ferait appel à un service backend
    setTimeout(() => {
      this.selectedTask!.status = 'COMPLETED';
      this.selectedTask!.completedAt = new Date();
      this.selectedTask!.timeSpent = formData.timeSpent;
      this.selectedTask!.notes = formData.notes;

      this.moveTaskToCompleted(this.selectedTask!);
      this.checkReservationCompletion(this.selectedTask!.reservation);
      
      this.selectedTask = null;
      this.taskUpdateForm.reset();
      this.loading = false;
      
      this.showSuccess('Tâche terminée avec succès');
    }, 1000);
  }

  private moveTaskToInProgress(taskExecution: TaskExecution): void {
    this.pendingTasks = this.pendingTasks.filter(t => t.taskId !== taskExecution.taskId);
    this.inProgressTasks.push(taskExecution);
    this.calculateStatistics();
  }

  private moveTaskToCompleted(taskExecution: TaskExecution): void {
    this.inProgressTasks = this.inProgressTasks.filter(t => t.taskId !== taskExecution.taskId);
    this.completedTasks.push(taskExecution);
    this.calculateStatistics();
  }

  private checkReservationCompletion(reservation: Reservation): void {
    // Vérifier si toutes les tâches de la réservation sont terminées
    const reservationTasks = [...this.pendingTasks, ...this.inProgressTasks, ...this.completedTasks]
      .filter(t => t.reservationId === reservation.id);
    
    const allCompleted = reservationTasks.every(t => t.status === 'COMPLETED');
    
    if (allCompleted && reservation.status !== ReservationStatus.COMPLETED) {
      this.reservationService.updateReservationStatus(
        reservation.id!, 
        ReservationStatus.COMPLETED
      ).subscribe({
        next: () => {
          reservation.status = ReservationStatus.COMPLETED;
          this.showSuccess('Réservation terminée automatiquement');
        },
        error: (error) => {
          console.error('Erreur lors de la finalisation de la réservation:', error);
        }
      });
    }
  }

  // Utilitaires
  getStatusColor(status: string): string {
    switch (status) {
      case 'PENDING': return 'warn';
      case 'IN_PROGRESS': return 'primary';
      case 'COMPLETED': return 'accent';
      default: return '';
    }
  }

  getStatusIcon(status: string): string {
    switch (status) {
      case 'PENDING': return 'schedule';
      case 'IN_PROGRESS': return 'play_circle';
      case 'COMPLETED': return 'check_circle';
      default: return 'help';
    }
  }

  formatDuration(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    
    if (hours > 0) {
      return `${hours}h ${mins}min`;
    }
    return `${mins}min`;
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(price);
  }

  getTaskPriority(reservation: Reservation): 'high' | 'medium' | 'low' {
    const now = new Date();
    const startDate = new Date(reservation.startDate);
    const diffHours = (startDate.getTime() - now.getTime()) / (1000 * 60 * 60);
    
    if (diffHours < 24) return 'high';
    if (diffHours < 72) return 'medium';
    return 'low';
  }

  getPriorityColor(priority: string): string {
    switch (priority) {
      case 'high': return '#f44336';
      case 'medium': return '#ff9800';
      case 'low': return '#4caf50';
      default: return '#666';
    }
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

  cancelTaskUpdate(): void {
    this.selectedTask = null;
    this.taskUpdateForm.reset();
  }

  refreshData(): void {
    this.loadAssignedReservations();
  }
}
