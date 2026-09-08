import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, Router, NavigationEnd, RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ConsultantSidebarComponent } from '../consultant-sidebar/consultant-sidebar.component';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-consultant-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    RouterModule,
    MatIconModule,
    MatTooltipModule,
    ConsultantSidebarComponent
  ],
  templateUrl: './consultant-layout.component.html',
  styleUrls: ['./consultant-layout.component.css']
})
export class ConsultantLayoutComponent implements OnInit {
  pageTitle = 'Tableau de bord';
  currentTime = '';
  mobileSidebarOpen = false;

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.updateTime();
    setInterval(() => this.updateTime(), 60000);

    this.updatePageTitle(this.router.url);
    this.router.events.pipe(
      filter(e => e instanceof NavigationEnd)
    ).subscribe((e: any) => {
      this.updatePageTitle(e.urlAfterRedirects || e.url);
      this.mobileSidebarOpen = false;
    });
  }

  updateTime(): void {
    const now = new Date();
    this.currentTime = now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  }

  updatePageTitle(url: string): void {
    if (url.includes('/consultant/dashboard')) {
      this.pageTitle = 'Cockpit Opérationnel';
    } else if (url.includes('/consultant/calendar')) {
      this.pageTitle = 'Planning & Disponibilités';
    } else if (url.includes('/consultant/tasks')) {
      this.pageTitle = 'Console d\'Interventions';
    } else if (url.includes('/consultant/evaluations')) {
      this.pageTitle = 'Avis & Satisfaction Client';
    } else {
      this.pageTitle = 'Espace Artisan';
    }
  }

  toggleMobileSidebar(): void {
    this.mobileSidebarOpen = !this.mobileSidebarOpen;
  }
}
