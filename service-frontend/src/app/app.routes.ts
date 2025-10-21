import { Routes } from '@angular/router';
import {LoginComponent} from './components/login/login.component';
import {RegisterComponent} from './components/register/register.component';
import {AdminDashboardComponent} from './components/admin-dashboard/admin-dashboard.component';
import {Home} from './components/home/home.component';
import {ClientDashboardComponent} from './components/client-dashboard/client-dashboard.component';
import { ConsultantDashboardComponent } from './components/consultant-dashboard/consultant-dashboard.component';
import {ManageConsultantsComponent} from './components/manage-consultants/manage-consultants.component';
import { ServiceComponent } from './components/admin/service/service.component';
import { TaskFormComponent } from './components/admin/task/task-form.component';
import { AdminLayoutComponent } from './components/admin-layout/admin-layout.component';
import { ListServicesTasksComponent } from './components/admin/list-services-tasks/list-services-tasks.component';
import { ListTasksComponent } from './components/admin/list-tasks/list-tasks.component';
import { ConsultantCalendarComponent } from './components/consultant-calendar/consultant-calendar.component';
import { ConsultantLayoutComponent } from './components/consultant-layout/consultant-layout.component';
import { AdminReservationsComponent } from './components/admin-reservations/admin-reservations.component';
import { CreateReservationComponent } from './components/create-reservation/create-reservation.component';
import { ClientReservationsComponent } from './components/client-reservations/client-reservations.component';
import { CreateReservationWithTasksComponent } from './components/client/create-reservation-with-tasks/create-reservation-with-tasks.component';
import { TaskManagementComponent } from './components/admin/task-management/task-management.component';
import { TaskExecutionComponent } from './components/consultant/task-execution/task-execution.component';
import { ClientEvaluationsComponent } from './components/client-evaluations/client-evaluations.component';
import { ConsultantEvaluationsPageComponent } from './components/consultant-evaluations-page/consultant-evaluations-page.component';
import { AdminEvaluationsComponent } from './components/admin/admin-evaluations/admin-evaluations.component';
import { EvaluationStatsComponent } from './components/admin/evaluation-stats/evaluation-stats.component';
import { AdminInvoicesComponent } from './components/admin/admin-invoices/admin-invoices.component';
import { AdminInvoiceDashboardComponent } from './components/admin/admin-invoice-dashboard/admin-invoice-dashboard.component';
import { ClientInvoicesComponent } from './components/client/client-invoices/client-invoices.component';
import { ClientInvoiceDetailComponent } from './components/client/client-invoice-detail/client-invoice-detail.component';
import { InvoicesSimpleComponent } from './components/invoices/invoices-simple.component';
import { InvoiceCreateSimpleComponent } from './components/invoices/invoice-create/invoice-create-simple.component';
import { InvoiceDetailComponent } from './components/invoices/invoice-detail/invoice-detail.component';
import { InvoiceDashboardComponent } from './components/invoices/invoice-dashboard/invoice-dashboard.component';
import { AuthGuard } from './guards/auth.guard';
import { AdminGuard } from './guards/admin.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'home', component: Home},

  // Client Routes
  {
    path: 'client',
    canActivate: [AuthGuard],
    children: [
      { path: 'dashboard', component: ClientDashboardComponent },
      { path: 'reservations', component: ClientReservationsComponent },
      { path: 'evaluations', component: ClientEvaluationsComponent },
      { path: 'invoices', component: ClientInvoicesComponent },
      { path: 'invoices/:id', component: ClientInvoiceDetailComponent },
      { path: 'invoices/:id/payment', loadComponent: () => import('./components/client-payment/client-payment.component').then(m => m.ClientPaymentComponent) },
      { path: 'create-reservation', redirectTo: 'create-reservation-with-tasks', pathMatch: 'full' },
      { path: 'create-reservation-with-tasks', component: CreateReservationWithTasksComponent },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  },

  // Consultant Routes
  {
    path: 'consultant',
    component: ConsultantLayoutComponent, // Use the layout component
    canActivate: [AuthGuard],
    children: [
      { path: 'dashboard', component: ConsultantDashboardComponent },
      { path: 'calendar', component: ConsultantCalendarComponent },
      { path: 'tasks', component: TaskExecutionComponent },
      { path: 'evaluations', component: ConsultantEvaluationsPageComponent },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  },

  // Admin Routes with Layout
  {
    path: 'admin',
    component: AdminLayoutComponent,
    canActivate: [AuthGuard, AdminGuard],
    children: [
      { path: 'dashboard', component: AdminDashboardComponent },
      { path: 'employees', component: ManageConsultantsComponent },
      { path: 'services', component: ServiceComponent },
      { path: 'tasks', component: ListTasksComponent },
      { path: 'tasks/new', component: TaskFormComponent },
      { path: 'tasks/new/:serviceId', component: TaskFormComponent },
      { path: 'tasks-management', component: TaskManagementComponent },
      { path: 'services-tasks', component: ListServicesTasksComponent },
      { path: 'reservations', component: AdminReservationsComponent },
      { path: 'evaluations', component: AdminEvaluationsComponent },
      { path: 'evaluation-stats', component: EvaluationStatsComponent },
      // Invoice Routes
      { path: 'invoices', component: AdminInvoicesComponent },
      { path: 'invoices/dashboard', component: AdminInvoiceDashboardComponent },
      { path: 'invoices/create', component: InvoiceCreateSimpleComponent },
      { path: 'invoices/:id', component: InvoiceDetailComponent },
      { path: 'invoices/:id/edit', component: InvoiceCreateSimpleComponent },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  },

];
