import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatBadgeModule } from '@angular/material/badge';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Subscription } from 'rxjs';
import { NotificationService, NotificationItem } from '../../../services/notification.service';

@Component({
  selector: 'app-notification-panel',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    MatBadgeModule,
    MatMenuModule,
    MatDividerModule,
    MatTooltipModule
  ],
  templateUrl: './notification-panel.component.html',
  styleUrls: ['./notification-panel.component.css']
})
export class NotificationPanelComponent implements OnInit, OnDestroy {
  notifications: NotificationItem[] = [];
  unreadCount = 0;
  
  private notificationsSubscription?: Subscription;
  private unreadCountSubscription?: Subscription;

  constructor(private notificationService: NotificationService) {}

  ngOnInit(): void {
    this.notificationService.loadStoredNotifications();
    
    this.notificationsSubscription = this.notificationService.notifications$.subscribe(
      notifications => {
        this.notifications = notifications.slice(0, 10); // Show only last 10
      }
    );
    
    this.unreadCountSubscription = this.notificationService.unreadCount$.subscribe(
      count => {
        this.unreadCount = count;
      }
    );
  }

  ngOnDestroy(): void {
    this.notificationsSubscription?.unsubscribe();
    this.unreadCountSubscription?.unsubscribe();
  }

  markAsRead(notification: NotificationItem): void {
    if (!notification.read) {
      this.notificationService.markAsRead(notification.id);
    }
  }

  markAllAsRead(): void {
    this.notificationService.markAllAsRead();
  }

  deleteNotification(notification: NotificationItem, event: Event): void {
    event.stopPropagation();
    this.notificationService.deleteNotification(notification.id);
  }

  clearAll(): void {
    this.notificationService.clearAllNotifications();
  }

  getNotificationIcon(type: string): string {
    switch (type) {
      case 'evaluation':
        return 'star';
      case 'reservation':
        return 'event';
      case 'system':
        return 'info';
      default:
        return 'notifications';
    }
  }

  getNotificationColor(type: string): string {
    switch (type) {
      case 'evaluation':
        return '#ff9800';
      case 'reservation':
        return '#2196f3';
      case 'system':
        return '#4caf50';
      default:
        return '#666';
    }
  }

  formatTime(timestamp: Date): string {
    const now = new Date();
    const diff = now.getTime() - new Date(timestamp).getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'À l\'instant';
    if (minutes < 60) return `Il y a ${minutes}min`;
    if (hours < 24) return `Il y a ${hours}h`;
    if (days < 7) return `Il y a ${days}j`;
    
    return new Date(timestamp).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit'
    });
  }

  trackByNotificationId(index: number, notification: NotificationItem): string {
    return notification.id;
  }
}
