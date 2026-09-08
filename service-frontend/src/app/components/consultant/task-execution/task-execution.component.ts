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
import { cleanText } from '../../../pipes/clean-text.pipe';

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
  actionLoading = false;
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
      this.currentUserId = this.authService.getCurrentUserId();
    }

    if (!this.currentUserId) {
      this.loading = false;
      this.showError('Utilisateur non identifié');
      return;
    }

    this.loading = true;
    
    this.reservationService.getReservationsByConsultant(this.currentUserId).subscribe({
      next: (reservations: Reservation[]) => {
        this.assignedReservations = (reservations || []).filter((r: Reservation) => 
          r.status === ReservationStatus.ASSIGNED || 
          r.status === ReservationStatus.IN_PROGRESS ||
          r.status === ReservationStatus.COMPLETED
        );
        this.processTasks();
        this.calculateStatistics();
        this.loading = false;
      },
      error: (error: any) => {
        console.error('Erreur lors du chargement des réservations:', error);
        this.assignedReservations = [];
        this.processTasks();
        this.calculateStatistics();
        this.loading = false;
      }
    });
  }

  private processTasks(): void {
    this.pendingTasks = [];
    this.inProgressTasks = [];
    this.completedTasks = [];

    this.assignedReservations.forEach(reservation => {
      reservation.title = cleanText(reservation.title || '');
      reservation.description = cleanText(reservation.description || '');
      if (reservation.tasks) {
        reservation.tasks.forEach(task => {
          task.name = cleanText(task.name || '');
          task.description = cleanText(task.description || '');
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
    if (taskExecution.reservation.status === ReservationStatus.ASSIGNED) {
      this.actionLoading = true;
      this.reservationService.updateReservationStatus(
        taskExecution.reservationId, 
        ReservationStatus.IN_PROGRESS
      ).subscribe({
        next: () => {
          taskExecution.status = 'IN_PROGRESS';
          taskExecution.startedAt = new Date();
          this.moveTaskToInProgress(taskExecution);
          this.actionLoading = false;
          this.showSuccess('Intervention démarrée avec succès');
        },
        error: (error) => {
          console.error('Erreur lors du démarrage de la tâche:', error);
          this.actionLoading = false;
          this.showError('Erreur lors du démarrage de la tâche');
        }
      });
    } else {
      taskExecution.status = 'IN_PROGRESS';
      taskExecution.startedAt = new Date();
      this.moveTaskToInProgress(taskExecution);
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
    this.actionLoading = true;

    setTimeout(() => {
      this.selectedTask!.status = 'COMPLETED';
      this.selectedTask!.completedAt = new Date();
      this.selectedTask!.timeSpent = formData.timeSpent;
      this.selectedTask!.notes = formData.notes;

      this.moveTaskToCompleted(this.selectedTask!);
      this.checkReservationCompletion(this.selectedTask!.reservation);
      
      this.selectedTask = null;
      this.taskUpdateForm.reset();
      this.actionLoading = false;
      
      this.showSuccess('Intervention clôturée avec succès');
    }, 600);
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

  getClientInitials(name?: string): string {
    if (!name) return 'CL';
    return name
      .trim()
      .split(' ')
      .filter(p => p.length > 0)
      .map(p => p[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();
  }

  addTimeSpent(extraMinutes: number): void {
    const current = Number(this.taskUpdateForm.get('timeSpent')?.value) || 0;
    this.taskUpdateForm.patchValue({
      timeSpent: Math.max(0, current + extraMinutes)
    });
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
