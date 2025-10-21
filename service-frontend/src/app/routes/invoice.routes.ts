import { Routes } from '@angular/router';
import { InvoicesComponent } from '../components/invoices/invoices.component';
import { InvoiceCreateComponent } from '../components/invoices/invoice-create/invoice-create.component';
import { InvoiceDetailComponent } from '../components/invoices/invoice-detail/invoice-detail.component';

export const invoiceRoutes: Routes = [
  {
    path: 'invoices',
    children: [
      {
        path: '',
        component: InvoicesComponent,
        data: { title: 'Gestion des Factures' }
      },
      {
        path: 'create',
        component: InvoiceCreateComponent,
        data: { title: 'Créer une Facture' }
      },
      {
        path: ':id',
        component: InvoiceDetailComponent,
        data: { title: 'Détail de la Facture' }
      },
      {
        path: ':id/edit',
        component: InvoiceCreateComponent,
        data: { title: 'Modifier la Facture' }
      }
    ]
  }
];
