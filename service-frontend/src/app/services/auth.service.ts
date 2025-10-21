import { Injectable } from '@angular/core';
import { BehaviorSubject, throwError, Observable, tap } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { UserInterface} from '../models/user-interface';
import {ClientInterface} from '../models/client-interface';
import { ConsultantInterface } from '../models/consultant-interface';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {LoginResponse} from '../models/login-response';
import {Router} from '@angular/router';
@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private baseUrl = 'http://localhost:8080/api';
  private authStatusListener = new BehaviorSubject<boolean>(this.isLoggedIn());

  constructor(private http: HttpClient, private router: Router) { }
  /*login(email: string, password: string): Observable<LoginResponse> {
    sessionStorage.clear(); // clear old data
    console.log('Attempting login with email:', email);

    return this.http.post<LoginResponse>(`${this.baseUrl}/login`, { email, password }).pipe(
      tap(res => {
        console.log('Login successful:', res);
        console.log('Raw role from backend:', res.role);

        const normalizedRole = res.role.replace('ROLE_', '').toLowerCase();
        console.log('Normalized role:', normalizedRole);

        sessionStorage.setItem('jwt', res.token);
        sessionStorage.setItem('role', normalizedRole);

        this.redirectUser(normalizedRole);
      }),
      catchError(err => {
        console.error('Login error:', err);
        return throwError(() => new Error('Login failed, check your credentials or network.'));
      })
    );
  }*/

  login(email: string, password: string): Observable<LoginResponse> {
    localStorage.clear(); // clear old data
    console.log('Attempting login with email:', email);

    return this.http.post<LoginResponse>(`${this.baseUrl}/auth/login`, { email, password }).pipe(
      tap(res => {
        console.log('Login successful:', res);
        console.log('Raw role from backend:', res.role);

        const normalizedRole = res.role.replace('ROLE_', '').toLowerCase();
        console.log('Normalized role:', normalizedRole);

        localStorage.setItem('jwt', res.token);
        localStorage.setItem('role', normalizedRole);
        if (res.userId) {
          localStorage.setItem('userId', res.userId.toString());
        }

        this.authStatusListener.next(true); // Notify subscribers
        this.redirectUser(normalizedRole);
      }),
      catchError(err => {
        console.error('Login error:', err);
        return throwError(() => new Error('Login failed, check your credentials or network.'));
      })
    );
  }

  private redirectUser(role: string): void {
    console.log('Redirecting user with role:', role);

    if (role === 'admin') {
      this.router.navigate(['/admin/dashboard']);
    } else if (role === 'consultant') {
      this.router.navigate(['/consultant/dashboard']);
    } else if (role === 'client') {
      this.router.navigate(['/client/dashboard']);
    } else {
      this.router.navigate(['/']);
    }
  }

  /*registerClient(formData: FormData): Observable<any> {
    return this.http.post('/api/register', formData);
  }

  registerSalarie(salarie: SalarieInterface): Observable<SalarieInterface> {
    return this.http.post<SalarieInterface>(`${this.baseUrl}/register/salarie`, salarie);
  }*/

  logout(): void {
    localStorage.removeItem('jwt');
    localStorage.removeItem('role');
    localStorage.removeItem('userId');
    this.authStatusListener.next(false); // Notify subscribers
    this.router.navigate(['/login']);
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('jwt');
  }

  getAuthStatusListener() {
    return this.authStatusListener.asObservable();
  }

  getCurrentUserId(): number {
    const userId = localStorage.getItem('userId');
    return userId ? parseInt(userId, 10) : 0;
  }

  getRole(): string {
    return localStorage.getItem('role') || '';
  }

  registerClient(formData: FormData): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/clients/save-client`, formData);
  }

  registerConsultant(formData: FormData): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/consultants/create-consultant`, formData);
  }




}
