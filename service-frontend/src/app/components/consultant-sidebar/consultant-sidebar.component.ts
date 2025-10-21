import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-consultant-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './consultant-sidebar.component.html',
  styleUrls: ['./consultant-sidebar.component.css']
})
export class ConsultantSidebarComponent {

}
