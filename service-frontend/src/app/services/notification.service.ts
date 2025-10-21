import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, interval } from 'rxjs';
import { switchMap, catchError } from 'rxjs/operators';

export interface NotificationItem {
  id: string;
  type: 'evaluation' | 'reservation' | 'system';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  data?: any;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private apiUrl = 'http://localhost:8080/api/notifications';
  
  private notificationsSubject = new BehaviorSubject<NotificationItem[]>([]);
  public notifications$ = this.notificationsSubject.asObservable();
  
  private unreadCountSubject = new BehaviorSubject<number>(0);
  public unreadCount$ = this.unreadCountSubject.asObservable();

  constructor(private http: HttpClient) {
    this.initializePolling();
  }

  private initializePolling(): void {
    // Poll for new notifications every 30 seconds
    interval(30000).pipe(
      switchMap(() => this.checkForNewEvaluations()),
      catchError(error => {
        console.error('Erreur lors de la vérification des notifications:', error);
        return [];
      })
    ).subscribe();
  }

  private checkForNewEvaluations(): Observable<any> {
    // For now, we'll simulate checking for new evaluations
    // In a real implementation, this would call a backend endpoint
    return new Observable(observer => {
      // Simulate checking for new evaluations
      const lastCheck = localStorage.getItem('lastNotificationCheck');
      const now = new Date().toISOString();
      
      if (!lastCheck) {
        localStorage.setItem('lastNotificationCheck', now);
        observer.next([]);
        observer.complete();
        return;
      }

      // In a real implementation, you would:
      // return this.http.get(`${this.apiUrl}/new-since/${lastCheck}`);
      
      localStorage.setItem('lastNotificationCheck', now);
      observer.next([]);
      observer.complete();
    });
  }

  addNotification(notification: Omit<NotificationItem, 'id' | 'timestamp' | 'read'>): void {
    const newNotification: NotificationItem = {
      ...notification,
      id: this.generateId(),
      timestamp: new Date(),
      read: false
    };

    const currentNotifications = this.notificationsSubject.value;
    const updatedNotifications = [newNotification, ...currentNotifications];
    
    this.notificationsSubject.next(updatedNotifications);
    this.updateUnreadCount();
    
    // Store in localStorage for persistence
    localStorage.setItem('notifications', JSON.stringify(updatedNotifications));
  }

  markAsRead(notificationId: string): void {
    const currentNotifications = this.notificationsSubject.value;
    const updatedNotifications = currentNotifications.map(notification =>
      notification.id === notificationId
        ? { ...notification, read: true }
        : notification
    );
    
    this.notificationsSubject.next(updatedNotifications);
    this.updateUnreadCount();
    
    localStorage.setItem('notifications', JSON.stringify(updatedNotifications));
  }

  markAllAsRead(): void {
    const currentNotifications = this.notificationsSubject.value;
    const updatedNotifications = currentNotifications.map(notification => ({
      ...notification,
      read: true
    }));
    
    this.notificationsSubject.next(updatedNotifications);
    this.updateUnreadCount();
    
    localStorage.setItem('notifications', JSON.stringify(updatedNotifications));
  }

  deleteNotification(notificationId: string): void {
    const currentNotifications = this.notificationsSubject.value;
    const updatedNotifications = currentNotifications.filter(
      notification => notification.id !== notificationId
    );
    
    this.notificationsSubject.next(updatedNotifications);
    this.updateUnreadCount();
    
    localStorage.setItem('notifications', JSON.stringify(updatedNotifications));
  }

  clearAllNotifications(): void {
    this.notificationsSubject.next([]);
    this.unreadCountSubject.next(0);
    localStorage.removeItem('notifications');
  }

  loadStoredNotifications(): void {
    const stored = localStorage.getItem('notifications');
    if (stored) {
      try {
        const notifications = JSON.parse(stored);
        this.notificationsSubject.next(notifications);
        this.updateUnreadCount();
      } catch (error) {
        console.error('Erreur lors du chargement des notifications:', error);
      }
    }
  }

  private updateUnreadCount(): void {
    const unreadCount = this.notificationsSubject.value.filter(n => !n.read).length;
    this.unreadCountSubject.next(unreadCount);
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
  }

  // Utility methods for specific notification types
  notifyNewEvaluation(clientName: string, consultantName: string, rating: number): void {
    this.addNotification({
      type: 'evaluation',
      title: 'Nouvelle Évaluation',
      message: `${clientName} a évalué ${consultantName} avec ${rating} étoiles`,
      data: { clientName, consultantName, rating }
    });
  }

  notifyEvaluationDeleted(evaluationId: number): void {
    this.addNotification({
      type: 'evaluation',
      title: 'Évaluation Supprimée',
      message: `Une évaluation a été supprimée par un administrateur`,
      data: { evaluationId }
    });
  }

  notifySystemMessage(title: string, message: string): void {
    this.addNotification({
      type: 'system',
      title,
      message
    });
  }
}
