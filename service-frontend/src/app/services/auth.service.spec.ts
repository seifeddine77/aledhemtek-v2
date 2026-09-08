import { Injectable } from '@angular/core';
import {Observable, tap} from 'rxjs';
import { catchError } from 'rxjs/operators';
import { UserInterface} from '../models/user-interface';
import {ClientInterface} from '../models/client-interface';
import {SalarieInterface} from '../models/salarie-interface';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {LoginResponse} from '../models/login-response';
import { environment } from '../../environments/environment';
@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private baseUrl = `${environment.apiUrl}/auth`;
  constructor(private http: HttpClient) { }
  login(email: string, password: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.baseUrl}/login`, { email, password })
      .pipe(
        tap(res => sessionStorage.setItem('jwt', res.token))
      );
  }

  registerClient(client: ClientInterface): Observable<ClientInterface> {
    return this.http.post<ClientInterface>(`${this.baseUrl}/register/client`, client);
  }

  registerSalarie(salarie: SalarieInterface): Observable<SalarieInterface> {
    return this.http.post<SalarieInterface>(`${this.baseUrl}/register/salarie`, salarie);
  }

  logout() {
    sessionStorage.removeItem('jwt');
  }

  isLoggedIn(): boolean {
    return !!sessionStorage.getItem('jwt');
  }
}
