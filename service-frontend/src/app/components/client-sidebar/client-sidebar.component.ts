import { Component } from '@angular/core';
import {RouterLink, RouterLinkActive} from "@angular/router";

@Component({
  selector: 'app-client-sidebar',
    imports: [
        RouterLink,
        RouterLinkActive
    ],
  templateUrl: './client-sidebar.component.html',
  styleUrl: './client-sidebar.component.css'
})
export class ClientSidebarComponent {
  isClosed = true; // Sidebar starts in closed state
  openSidebar() {
    this.isClosed = false;
  }

  closeSidebar() {
    this.isClosed = true;
  }
}
