import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ServiceDto } from '../models/service.model';

const BASIC_URL = 'http://localhost:8080/';

@Injectable({
  providedIn: 'root'
})
export class PublicService {

  constructor(private http: HttpClient) { }

  /**
   * Get all services without authentication
   */
  getAllServices(): Observable<ServiceDto[]> {
    return this.http.get<ServiceDto[]>(BASIC_URL + 'api/public/services');
  }

  /**
   * Get all categories without authentication
   */
  getAllCategories(): Observable<any[]> {
    return this.http.get<any[]>(BASIC_URL + 'api/public/categories');
  }

  /**
   * Get services by category without authentication
   */
  getServicesByCategory(categoryId: number): Observable<ServiceDto[]> {
    return this.http.get<ServiceDto[]>(BASIC_URL + `api/public/categories/${categoryId}/services`);
  }

  /**
   * Get service details without authentication
   */
  getServiceById(serviceId: number): Observable<ServiceDto> {
    return this.http.get<ServiceDto>(BASIC_URL + `api/public/services/${serviceId}`);
  }

  /**
   * Get tasks by service without authentication
   */
  getTasksByService(serviceId: number): Observable<any[]> {
    return this.http.get<any[]>(BASIC_URL + `api/public/services/${serviceId}/tasks`);
  }

  /**
   * Search services without authentication
   */
  searchServices(keyword: string): Observable<ServiceDto[]> {
    return this.http.get<ServiceDto[]>(BASIC_URL + `api/public/services/search?keyword=${keyword}`);
  }
}
