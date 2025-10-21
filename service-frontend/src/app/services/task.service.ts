import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Task } from '../models/task.model';

const BASIC_URL = 'http://localhost:8080/';

export interface RateDto {
  id?: number;
  price: number;
  startDate: Date | null;
  endDate: Date | null;
}

export interface MaterialDto {
  id?: number;
  name: string;
  quantity: number;
}

export interface TaskDto {
  id?: number;
  name: string;
  duration: number;
  description?: string;
  imageName?: string;
  serviceId: number;
  rates?: RateDto[];
  materials?: MaterialDto[];
  price?: number;
}

@Injectable({
  providedIn: 'root'
})
export class TaskService {

  constructor(private http: HttpClient) { }

  /**
   * Récupérer toutes les tâches
   */
  getAllTasks(): Observable<TaskDto[]> {
    return this.http.get<TaskDto[]>(BASIC_URL + 'api/tasks', {
      headers: this.createAuthorizationHeader()
    });
  }

  /**
   * Récupérer une tâche par ID
   */
  getTaskById(taskId: number): Observable<TaskDto> {
    return this.http.get<TaskDto>(BASIC_URL + `api/tasks/${taskId}`, {
      headers: this.createAuthorizationHeader()
    });
  }

  /**
   * Récupérer les tâches par service
   */
  getTasksByService(serviceId: number): Observable<TaskDto[]> {
    return this.http.get<TaskDto[]>(BASIC_URL + `api/tasks/service/${serviceId}`, {
      headers: this.createAuthorizationHeader()
    });
  }

  /**
   * Créer une nouvelle tâche
   */
  createTask(taskDto: TaskDto, image: File): Observable<TaskDto> {
    const formData = new FormData();
    formData.append('image', image);
    formData.append('taskDto', new Blob([JSON.stringify(taskDto)], { type: 'application/json' }));

    return this.http.post<TaskDto>(BASIC_URL + 'api/tasks', formData, {
      headers: this.createAuthorizationHeader()
    });
  }

  /**
   * Mettre à jour une tâche
   */
  updateTask(taskId: number, taskDto: TaskDto): Observable<TaskDto> {
    return this.http.put<TaskDto>(BASIC_URL + `api/tasks/${taskId}`, taskDto, {
      headers: this.createAuthorizationHeader()
    });
  }

  /**
   * Supprimer une tâche
   */
  deleteTask(taskId: number): Observable<void> {
    return this.http.delete<void>(BASIC_URL + `api/tasks/${taskId}`, {
      headers: this.createAuthorizationHeader()
    });
  }

  /**
   * Ajouter un tarif à une tâche
   */
  addRateToTask(taskId: number, rate: RateDto): Observable<RateDto> {
    return this.http.post<RateDto>(BASIC_URL + `api/tasks/${taskId}/rates`, rate, {
      headers: this.createAuthorizationHeader()
    });
  }

  /**
   * Récupérer les tarifs d'une tâche
   */
  getTaskRates(taskId: number): Observable<RateDto[]> {
    return this.http.get<RateDto[]>(BASIC_URL + `api/tasks/${taskId}/rates`, {
      headers: this.createAuthorizationHeader()
    });
  }

  /**
   * Mettre à jour un tarif
   */
  updateRate(rateId: number, rate: RateDto): Observable<RateDto> {
    return this.http.put<RateDto>(BASIC_URL + `api/tasks/rates/${rateId}`, rate, {
      headers: this.createAuthorizationHeader()
    });
  }

  /**
   * Supprimer un tarif
   */
  deleteRate(rateId: number): Observable<void> {
    return this.http.delete<void>(BASIC_URL + `api/tasks/rates/${rateId}`, {
      headers: this.createAuthorizationHeader()
    });
  }

  /**
   * Ajouter un matériau à une tâche
   */
  addMaterialToTask(taskId: number, material: MaterialDto): Observable<MaterialDto> {
    return this.http.post<MaterialDto>(BASIC_URL + `api/tasks/${taskId}/materials`, material, {
      headers: this.createAuthorizationHeader()
    });
  }

  /**
   * Récupérer les matériaux d'une tâche
   */
  getTaskMaterials(taskId: number): Observable<MaterialDto[]> {
    return this.http.get<MaterialDto[]>(BASIC_URL + `api/tasks/${taskId}/materials`, {
      headers: this.createAuthorizationHeader()
    });
  }

  /**
   * Mettre à jour un matériau
   */
  updateMaterial(materialId: number, material: MaterialDto): Observable<MaterialDto> {
    return this.http.put<MaterialDto>(BASIC_URL + `api/tasks/materials/${materialId}`, material, {
      headers: this.createAuthorizationHeader()
    });
  }

  /**
   * Supprimer un matériau
   */
  deleteMaterial(materialId: number): Observable<void> {
    return this.http.delete<void>(BASIC_URL + `api/tasks/materials/${materialId}`, {
      headers: this.createAuthorizationHeader()
    });
  }

  /**
   * Calculer le prix total d'une tâche
   */
  calculateTaskTotalPrice(taskId: number): Observable<number> {
    return this.http.get<number>(BASIC_URL + `api/tasks/${taskId}/total-price`, {
      headers: this.createAuthorizationHeader()
    });
  }

  /**
   * Rechercher des tâches par nom
   */
  searchTasks(keyword: string): Observable<TaskDto[]> {
    return this.http.get<TaskDto[]>(BASIC_URL + `api/tasks/search?keyword=${keyword}`, {
      headers: this.createAuthorizationHeader()
    });
  }

  // ========== MÉTHODES PUBLIQUES (SANS AUTHENTIFICATION) ==========

  /**
   * Récupérer toutes les tâches (public)
   */
  getAllTasksPublic(): Observable<TaskDto[]> {
    return this.http.get<TaskDto[]>(BASIC_URL + 'api/public/tasks');
  }

  /**
   * Récupérer les tâches par service (public)
   */
  getTasksByServicePublic(serviceId: number): Observable<TaskDto[]> {
    return this.http.get<TaskDto[]>(BASIC_URL + `api/public/tasks/service/${serviceId}`);
  }

  /**
   * Créer les headers d'autorisation
   */
  private createAuthorizationHeader(): HttpHeaders {
    let authHeaders: HttpHeaders = new HttpHeaders();
    const token = localStorage.getItem('jwt');
    if (token) {
      return authHeaders.set('Authorization', 'Bearer ' + token);
    }
    return authHeaders;
  }
}
