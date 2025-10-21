import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Material } from '../models/Material';

const BASIC_URL = 'http://localhost:8080/';

@Injectable({
  providedIn: 'root'
})
export class AdminService {

  constructor(private http: HttpClient) { }

    createCategory(categoryDto: {name: string, description: string}, image: File): Observable<any> {
        const formData = new FormData();
    formData.append('file', image);
    formData.append('name', categoryDto.name);
    formData.append('description', categoryDto.description);

    return this.http.post(BASIC_URL + 'api/admin/categories', formData, {
      headers: this.createAuthorizationHeader()
    });
  }

  getAllCategories(): Observable<any> {
    return this.http.get(BASIC_URL + 'api/admin/categories', {
      headers: this.createAuthorizationHeader()
    });
  }

    createService(serviceDto: {name: string, description: string, categoryId: number}, image: File): Observable<any> {
        const formData = new FormData();
    formData.append('image', image);
    formData.append('serviceDto', new Blob([JSON.stringify(serviceDto)], { type: 'application/json' }));

    return this.http.post(BASIC_URL + 'api/admin/services', formData, {
      headers: this.createAuthorizationHeader()
    });
  }

  getAllServices(): Observable<any> {
    return this.http.get(BASIC_URL + 'api/admin/services', {
      headers: this.createAuthorizationHeader()
    });
  }

    createTask(taskDto: any, image: File): Observable<any> {
    const formData = new FormData();
    formData.append('image', image);
    formData.append('taskDto', new Blob([JSON.stringify(taskDto)], { type: 'application/json' }));

    return this.http.post<any>(BASIC_URL + 'api/admin/tasks', formData, {
      headers: this.createAuthorizationHeader()
    });
  }

  getAllTasks(): Observable<any> {
    return this.http.get(BASIC_URL + 'api/admin/tasks', {
      headers: this.createAuthorizationHeader()
    });
  }

  deleteTask(taskId: number): Observable<any> {
    console.log(`Tentative de suppression de la tâche avec l'ID : ${taskId}`);
    return this.http.delete(BASIC_URL + `api/admin/tasks/${taskId}`, {
      headers: this.createAuthorizationHeader()
    });
  }

  updateTask(taskId: number, taskData: any): Observable<any> {
    return this.http.put(BASIC_URL + `api/admin/tasks/${taskId}`, taskData, {
      headers: this.createAuthorizationHeader()
    });
  }

  addMaterialToTask(taskId: number, material: { name: string, quantity: number }): Observable<Material> {
    return this.http.post<Material>(BASIC_URL + `api/admin/tasks/${taskId}/materials`, material, {
      headers: this.createAuthorizationHeader()
    });
  }

  updateMaterial(materialId: number, material: Material): Observable<Material> {
    return this.http.put<Material>(BASIC_URL + `api/admin/materials/${materialId}`, material, {
      headers: this.createAuthorizationHeader()
    });
  }

  deleteMaterial(materialId: number): Observable<any> {
    return this.http.delete(BASIC_URL + `api/admin/materials/${materialId}`, {
      headers: this.createAuthorizationHeader()
    });
  }

  private createAuthorizationHeader(): HttpHeaders {
    let authHeaders: HttpHeaders = new HttpHeaders();
    const token = localStorage.getItem('jwt'); // Assumes token is stored in localStorage
    if (token) {
      return authHeaders.set('Authorization', 'Bearer ' + token);
    }
    return authHeaders;
  }
}
