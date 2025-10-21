import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatBadgeModule } from '@angular/material/badge';
import { TaskService, TaskDto } from '../../../services/task.service';
import { AdminService } from '../../../services/admin.service';
import { ReservationService } from '../../../services/reservation.service';
import { PriceValidationService } from '../../../services/price-validation.service';
import { HttpClient } from '@angular/common/http';

export interface SelectedTask {
  task: TaskDto;
  quantity: number;
  totalPrice: number;
}

@Component({
  selector: 'app-task-selector',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatCheckboxModule,
    MatExpansionModule,
    MatBadgeModule
  ],
  templateUrl: './task-selector.component.html',
  styleUrls: ['./task-selector.component.css']
})
export class TaskSelectorComponent implements OnInit {

  @Input() serviceId: number | null = null;
  @Input() preSelectedTasks: TaskDto[] = [];
  @Output() tasksSelected = new EventEmitter<SelectedTask[]>();
  @Output() totalPriceChanged = new EventEmitter<number>();

  services: any[] = [];
  tasksByService: { [serviceId: number]: TaskDto[] } = {};
  selectedTasks: Map<number, SelectedTask> = new Map();
  totalPrice: number = 0;

  constructor(
    private taskService: TaskService,
    private adminService: AdminService,
    private reservationService: ReservationService,
    private priceValidationService: PriceValidationService,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.loadServices();
    if (this.serviceId) {
      this.loadTasksForService(this.serviceId);
    }
    this.initializePreSelectedTasks();
  }

  loadServices(): void {
    // Utiliser l'endpoint public pour les services
    this.http.get<any[]>('http://localhost:8080/api/public/services').subscribe({
      next: (services: any[]) => {
        this.services = services;
        console.log('Services chargés:', services);
        // Charger les tâches pour chaque service
        services.forEach((service: any) => {
          this.loadTasksForService(service.id);
        });
      },
      error: (error: any) => {
        console.error('Erreur lors du chargement des services:', error);
      }
    });
  }

  loadTasksForService(serviceId: number): void {
    // Utiliser l'endpoint public pour les tâches
    this.http.get<TaskDto[]>(`http://localhost:8080/api/public/tasks/service/${serviceId}`).subscribe({
      next: (tasks: TaskDto[]) => {
        this.tasksByService[serviceId] = tasks;
        console.log(`Tâches chargées pour le service ${serviceId}:`, tasks);
      },
      error: (error: any) => {
        console.error(`Erreur lors du chargement des tâches pour le service ${serviceId}:`, error);
      }
    });
  }

  initializePreSelectedTasks(): void {
    if (this.preSelectedTasks && this.preSelectedTasks.length > 0) {
      this.preSelectedTasks.forEach(task => {
        const selectedTask: SelectedTask = {
          task: task,
          quantity: 1,
          totalPrice: this.getTaskMinPrice(task)
        };
        this.selectedTasks.set(task.id!, selectedTask);
      });
      this.updateTotalPrice();
    }
  }

  isTaskSelected(taskId: number): boolean {
    return this.selectedTasks.has(taskId);
  }

  toggleTaskSelection(task: TaskDto): void {
    const taskId = task.id!;
    
    if (this.selectedTasks.has(taskId)) {
      this.selectedTasks.delete(taskId);
    } else {
      const selectedTask: SelectedTask = {
        task: task,
        quantity: 1,
        totalPrice: this.getTaskMinPrice(task)
      };
      this.selectedTasks.set(taskId, selectedTask);
    }
    
    this.updateTotalPrice();
    this.emitSelectedTasks();
  }

  updateTaskQuantity(taskId: number, quantity: number): void {
    const selectedTask = this.selectedTasks.get(taskId);
    if (selectedTask && quantity > 0) {
      selectedTask.quantity = quantity;
      // The individual task price will be updated in the updateTotalPrice call
      this.updateTotalPrice(); 
      this.emitSelectedTasks();
    }
  }

  removeTask(taskId: number): void {
    this.selectedTasks.delete(taskId);
    this.updateTotalPrice();
    this.emitSelectedTasks();
  }

  updateTotalPrice(): void {
    const taskIds = Array.from(this.selectedTasks.keys());
    
    if (taskIds.length === 0) {
      this.totalPrice = 0;
      this.totalPriceChanged.emit(this.totalPrice);
      return;
    }
    
    // Préparer les quantités pour chaque tâche
    const taskQuantities: { [key: string]: number } = {};
    this.selectedTasks.forEach((selectedTask, taskId) => {
      taskQuantities[taskId.toString()] = selectedTask.quantity;
    });
    
    // Valider les données avant l'envoi
    if (!this.priceValidationService.validateTaskIds(taskIds)) {
      console.error('IDs de tâches invalides:', taskIds);
      this.totalPrice = 0;
      this.totalPriceChanged.emit(this.totalPrice);
      return;
    }
    
    if (!this.priceValidationService.validateTaskQuantities(taskQuantities)) {
      console.error('Quantités de tâches invalides:', taskQuantities);
      this.totalPrice = 0;
      this.totalPriceChanged.emit(this.totalPrice);
      return;
    }
    
    // Utiliser l'endpoint public pour calculer le prix réel avec quantités
    this.reservationService.calculateTasksPricePublicWithQuantities(taskIds, taskQuantities).subscribe({
      next: (response: any) => {
        console.log('Réponse du backend:', response);
        
        // Utiliser le service de validation pour traiter la réponse
        const validation = this.priceValidationService.validatePriceResponse(response);
        
        if (validation.isValid) {
          this.totalPrice = validation.price;
          console.log('Prix total validé:', this.totalPrice);
        } else {
          console.error('Erreur de validation du prix:', validation.error);
          this.totalPrice = 0;
        }
        
        console.log('Quantités envoyées:', taskQuantities);
        this.totalPriceChanged.emit(this.totalPrice);
        
        // Mettre à jour les prix individuels des tâches sélectionnées
        this.updateIndividualTaskPrices();
      },
      error: (error: any) => {
        console.error('Erreur lors du calcul du prix:', error);
        // Fallback sur le calcul local avec quantités
        this.totalPrice = Array.from(this.selectedTasks.values())
          .reduce((total, selectedTask) => total + (this.getTaskMinPrice(selectedTask.task) * selectedTask.quantity), 0);
        this.totalPriceChanged.emit(this.totalPrice);
      }
    });
  }

  emitSelectedTasks(): void {
    const selectedTasksArray = Array.from(this.selectedTasks.values());
    this.tasksSelected.emit(selectedTasksArray);
  }

  updateIndividualTaskPrices(): void {
    // Cette méthode pourrait être utilisée pour mettre à jour les prix individuels
    // si le backend retournait des prix détaillés par tâche
    // Pour l'instant, on garde les prix calculés localement
    this.selectedTasks.forEach((selectedTask, taskId) => {
      selectedTask.totalPrice = this.getTaskMinPrice(selectedTask.task) * selectedTask.quantity;
    });
  }

  getTaskMinPrice(task: TaskDto): number {
    if (task.rates && task.rates.length > 0) {
      const validRates = task.rates.filter(rate => rate.price > 0);
      if (validRates.length > 0) {
        return Math.min(...validRates.map(rate => rate.price));
      }
    }
    return 0;
  }

  getTaskPriceRange(task: TaskDto): string {
    if (task.rates && task.rates.length > 0) {
      const validRates = task.rates.filter(rate => rate.price > 0);
      if (validRates.length > 0) {
        const prices = validRates.map(rate => rate.price);
        const minPrice = Math.min(...prices);
        const maxPrice = Math.max(...prices);
        
        if (minPrice === maxPrice) {
          return `${minPrice}€`;
        } else {
          return `${minPrice}€ - ${maxPrice}€`;
        }
      }
    }
    return 'Prix sur devis';
  }

  getServiceName(serviceId: number): string {
    const service = this.services.find(s => s.id === serviceId);
    return service ? service.name : 'Service inconnu';
  }

  getImageUrl(imageName: string | undefined): string {
    if (imageName) {
      // Enlever le préfixe 'tasks/' s'il existe déjà (pour compatibilité avec anciennes données)
      const cleanImageName = imageName.startsWith('tasks/') ? imageName.substring(6) : imageName;
      return `http://localhost:8080/uploads/tasks/${cleanImageName}`;
    }
    return 'assets/images/default-task.png';
  }

  getSelectedTasksCount(): number {
    return this.selectedTasks.size;
  }

  clearAllSelections(): void {
    this.selectedTasks.clear();
    this.updateTotalPrice();
    this.emitSelectedTasks();
  }

  getTasksByServiceId(serviceId: number): TaskDto[] {
    return this.tasksByService[serviceId] || [];
  }

  hasTasksForService(serviceId: number): boolean {
    const tasks = this.tasksByService[serviceId];
    return tasks && tasks.length > 0;
  }
}
