import { Component, OnInit } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from './components/navbar/navbar.component';
import { FooterComponent } from './components/footer/footer.component';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, NavbarComponent, FooterComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'alaa-dhemtk-frontV2';
  isAdminRoute = false;
  isPortalRoute = false;

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.updateRouteState(window.location.pathname || this.router.url);
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      const url = event.urlAfterRedirects || event.url;
      this.updateRouteState(url);
    });
  }

  private updateRouteState(url: string): void {
    this.isAdminRoute = url.startsWith('/admin');
    this.isPortalRoute = url.startsWith('/admin') || url.startsWith('/client') || url.startsWith('/consultant');
  }
}
