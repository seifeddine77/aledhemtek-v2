import { Component, HostBinding } from '@angular/core';
import { CommonModule } from '@angular/common';
import {RouterLink, RouterLinkActive} from '@angular/router';
import { NotificationPanelComponent } from '../shared/notification-panel/notification-panel.component';

@Component({
  selector: 'app-admin-sidebar',
  imports: [
    CommonModule,
    RouterLink,
    RouterLinkActive,
    NotificationPanelComponent
  ],
  templateUrl: './admin-sidebar.component.html',
  styleUrl: './admin-sidebar.component.css'
})

export class AdminSidebarComponent {
  isClosed = true; // Sidebar starts in closed state

  // Bind .closed class on host element when sidebar is collapsed
  @HostBinding('class.closed') get closed() {
    return this.isClosed;
  }
  openSidebar() {
    this.isClosed = false;
  }

  closeSidebar() {
    this.isClosed = true;
  }
}
