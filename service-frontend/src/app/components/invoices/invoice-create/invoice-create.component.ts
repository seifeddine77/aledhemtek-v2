import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatDividerModule } from '@angular/material/divider';

import { InvoiceService } from '../../../services/invoice.service';
import { ReservationService } from '../../../services/reservation.service';
import { ClientService } from '../../../services/client.service';
import { TaskService } from '../../../services/task.service';
import { Invoice, InvoiceCreateRequest, InvoiceItemCreateRequest } from '../../../models/invoice.model';
import { Client } from '../../../models/client.model';
import { Reservation } from '../../../models/reservation.model';
import { Task } from '../../../models/task.model';
import { Observable } from 'rxjs';
import { startWith, map } from 'rxjs/operators';

@Component({
  selector: 'app-invoice-create',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatAutocompleteModule,
    MatDividerModule
  ],
  templateUrl: './invoice-create.component.html',
  styleUrls: ['./invoice-create.component.css']
})
export class InvoiceCreateComponent implements OnInit {
  invoiceForm!: FormGroup;
  loading = false;
  clients: Client[] = [];
  reservations: Reservation[] = [];
  tasks: Task[] = [];
  filteredClients!: Observable<Client[]>;
  filteredReservations!: Observable<Reservation[]>;
  filteredTasks!: Observable<Task[]>;

  constructor(
    private fb: FormBuilder,
    private invoiceService: InvoiceService,
    private reservationService: ReservationService,
    private clientService: ClientService,
    private taskService: TaskService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.initializeForm();
    this.loadData();
    this.setupAutocomplete();
  }

  initializeForm(): void {
    this.invoiceForm = this.fb.group({
      clientId: ['', Validators.required],
      reservationId: [''],
      dueDate: ['', Validators.required],
      notes: [''],
      invoiceItems: this.fb.array([this.createInvoiceItemGroup()])
    });
  }

  createInvoiceItemGroup(): FormGroup {
    return this.fb.group({
      designation: ['', Validators.required],
      description: [''],
      quantity: [1, [Validators.required, Validators.min(1)]],
      unitPrice: [0, [Validators.required, Validators.min(0)]],
      taxRate: [20],
      taskId: ['']
    });
  }

  get invoiceItems(): FormArray {
    return this.invoiceForm.get('invoiceItems') as FormArray;
  }

  addInvoiceItem(): void {
    this.invoiceItems.push(this.createInvoiceItemGroup());
  }

  removeInvoiceItem(index: number): void {
    if (this.invoiceItems.length > 1) {
      this.invoiceItems.removeAt(index);
    }
  }

  loadData(): void {
    this.loading = true;
    
    // Load clients
    this.clientService.getAllClients().subscribe({
      next: (clients) => {
        this.clients = clients;
      },
      error: (error) => {
        console.error('Error loading clients:', error);
        this.snackBar.open('Erreur lors du chargement des clients', 'Fermer', { duration: 3000 });
      }
    });

    // Load reservations
    this.reservationService.getAllReservations().subscribe({
      next: (reservations) => {
        this.reservations = reservations;
      },
      error: (error) => {
        console.error('Error loading reservations:', error);
        this.snackBar.open('Erreur lors du chargement des réservations', 'Fermer', { duration: 3000 });
      }
    });

    // Load tasks
    this.taskService.getAllTasks().subscribe({
      next: (tasks) => {
        this.tasks = tasks;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading tasks:', error);
        this.snackBar.open('Erreur lors du chargement des tâches', 'Fermer', { duration: 3000 });
        this.loading = false;
      }
    });
  }

  setupAutocomplete(): void {
    // Client autocomplete
    this.filteredClients = this.invoiceForm.get('clientId')!.valueChanges.pipe(
      startWith(''),
      map(value => this._filterClients(value || ''))
    );

    // Reservation autocomplete
    this.filteredReservations = this.invoiceForm.get('reservationId')!.valueChanges.pipe(
      startWith(''),
      map(value => this._filterReservations(value || ''))
    );
  }

  private _filterClients(value: string): Client[] {
    const filterValue = value.toString().toLowerCase();
    return this.clients.filter(client => 
      client.name?.toLowerCase().includes(filterValue) ||
      client.email?.toLowerCase().includes(filterValue)
    );
  }

  private _filterReservations(value: string): Reservation[] {
    const filterValue = value.toString().toLowerCase();
    return this.reservations.filter(reservation => 
      reservation.title?.toLowerCase().includes(filterValue) ||
      reservation.description?.toLowerCase().includes(filterValue)
    );
  }

  displayClientFn(clientId: number): string {
    const client = this.clients.find(c => c.id === clientId);
    return client ? `${client.name} (${client.email})` : '';
  }

  displayReservationFn(reservationId: number): string {
    const reservation = this.reservations.find(r => r.id === reservationId);
    return reservation ? `${reservation.title} - ${reservation.description}` : '';
  }

  onTaskSelected(index: number, taskId: number): void {
    const task = this.tasks.find(t => t.id === taskId);
    if (task) {
      const itemGroup = this.invoiceItems.at(index) as FormGroup;
      itemGroup.patchValue({
        designation: task.name,
        description: task.description,
        unitPrice: this.getTaskCurrentPrice(task)
      });
    }
  }

  getTaskCurrentPrice(task: Task): number {
    // Prix par défaut pour les tâches
    return 50; // Prix de base, peut être configuré
  }

  calculateItemTotal(index: number): number {
    const item = this.invoiceItems.at(index).value;
    return item.quantity * item.unitPrice;
  }

  calculateSubtotal(): number {
    return this.invoiceItems.controls.reduce((total, control) => {
      const item = control.value;
      return total + (item.quantity * item.unitPrice);
    }, 0);
  }

  calculateTotalTax(): number {
    return this.invoiceItems.controls.reduce((total, control) => {
      const item = control.value;
      const itemTotal = item.quantity * item.unitPrice;
      return total + (itemTotal * (item.taxRate || 0) / 100);
    }, 0);
  }

  calculateTotal(): number {
    return this.calculateSubtotal() + this.calculateTotalTax();
  }

  onSubmit(): void {
    if (this.invoiceForm.valid) {
      this.loading = true;
      
      const formValue = this.invoiceForm.value;
      const invoiceRequest: InvoiceCreateRequest = {
        clientId: formValue.clientId,
        reservationId: formValue.reservationId || undefined,
        dueDate: formValue.dueDate,
        notes: formValue.notes,
        invoiceItems: formValue.invoiceItems.map((item: any) => ({
          designation: item.designation,
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          taxRate: item.taxRate,
          taskId: item.taskId || undefined
        } as InvoiceItemCreateRequest))
      };

      this.invoiceService.createInvoice(invoiceRequest).subscribe({
        next: (invoice) => {
          this.snackBar.open('Facture créée avec succès', 'Fermer', { 
            duration: 3000,
            panelClass: ['success-snackbar']
          });
          this.router.navigate(['/admin/invoices']);
        },
        error: (error) => {
          console.error('Error creating invoice:', error);
          this.snackBar.open('Erreur lors de la création de la facture', 'Fermer', { 
            duration: 3000,
            panelClass: ['error-snackbar']
          });
          this.loading = false;
        }
      });
    } else {
      this.markFormGroupTouched();
      this.snackBar.open('Veuillez corriger les erreurs dans le formulaire', 'Fermer', { duration: 3000 });
    }
  }

  private markFormGroupTouched(): void {
    Object.keys(this.invoiceForm.controls).forEach(key => {
      const control = this.invoiceForm.get(key);
      control?.markAsTouched();
      
      if (control instanceof FormArray) {
        control.controls.forEach(arrayControl => {
          if (arrayControl instanceof FormGroup) {
            Object.keys(arrayControl.controls).forEach(arrayKey => {
              arrayControl.get(arrayKey)?.markAsTouched();
            });
          }
        });
      }
    });
  }

  onCancel(): void {
    this.router.navigate(['/admin/invoices']);
  }
}
