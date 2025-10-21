import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ConsultantSidebarComponent } from '../consultant-sidebar/consultant-sidebar.component';

@Component({
  selector: 'app-consultant-layout',
  standalone: true,
  imports: [RouterOutlet, ConsultantSidebarComponent],
  templateUrl: './consultant-layout.component.html',
  styleUrls: ['./consultant-layout.component.css']
})
export class ConsultantLayoutComponent {

}
