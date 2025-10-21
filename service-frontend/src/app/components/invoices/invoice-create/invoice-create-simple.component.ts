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

import { InvoiceService } from '../../../services/invoice.service';
import { InvoiceCreateRequest, InvoiceItemCreateRequest } from '../../../models/invoice.model';

@Component({
  selector: 'app-invoice-create-simple',
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
    MatProgressSpinnerModule
  ],
  template: `
    <div class="invoice-create-container">
      <mat-card>
        <mat-card-header>
          <mat-card-title>Créer une Facture</mat-card-title>
        </mat-card-header>
        
        <mat-card-content>
          <form [formGroup]="invoiceForm" (ngSubmit)="onSubmit()">
            <!-- Client ID -->
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>ID Client</mat-label>
              <input matInput type="number" formControlName="clientId" required>
              <mat-error *ngIf="invoiceForm.get('clientId')?.hasError('required')">
                L'ID client est requis
              </mat-error>
            </mat-form-field>

            <!-- Due Date -->
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Date d'échéance</mat-label>
              <input matInput [matDatepicker]="picker" formControlName="dueDate" required>
              <mat-datepicker-toggle matSuffix [for]="picker"></mat-datepicker-toggle>
              <mat-datepicker #picker></mat-datepicker>
              <mat-error *ngIf="invoiceForm.get('dueDate')?.hasError('required')">
                La date d'échéance est requise
              </mat-error>
            </mat-form-field>

            <!-- Notes -->
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Notes</mat-label>
              <textarea matInput formControlName="notes" rows="3"></textarea>
            </mat-form-field>

            <!-- Invoice Items -->
            <div class="invoice-items-section">
              <h3>Lignes de facture</h3>
              <div formArrayName="invoiceItems">
                <div *ngFor="let item of invoiceItems.controls; let i = index" [formGroupName]="i" class="invoice-item">
                  <mat-card class="item-card">
                    <div class="item-row">
                      <mat-form-field appearance="outline">
                        <mat-label>Désignation</mat-label>
                        <input matInput formControlName="designation" required>
                      </mat-form-field>

                      <mat-form-field appearance="outline">
                        <mat-label>Quantité</mat-label>
                        <input matInput type="number" formControlName="quantity" required>
                      </mat-form-field>

                      <mat-form-field appearance="outline">
                        <mat-label>Prix unitaire</mat-label>
                        <input matInput type="number" step="0.01" formControlName="unitPrice" required>
                      </mat-form-field>

                      <button mat-icon-button color="warn" type="button" (click)="removeInvoiceItem(i)">
                        <mat-icon>delete</mat-icon>
                      </button>
                    </div>

                    <mat-form-field appearance="outline" class="full-width">
                      <mat-label>Description</mat-label>
                      <textarea matInput formControlName="description" rows="2"></textarea>
                    </mat-form-field>
                  </mat-card>
                </div>
              </div>

              <button mat-raised-button color="accent" type="button" (click)="addInvoiceItem()">
                <mat-icon>add</mat-icon>
                Ajouter une ligne
              </button>
            </div>

            <!-- Actions -->
            <div class="form-actions">
              <button mat-button type="button" (click)="onCancel()">Annuler</button>
              <button mat-raised-button color="primary" type="submit" [disabled]="invoiceForm.invalid || loading">
                <mat-spinner *ngIf="loading" diameter="20"></mat-spinner>
                Créer la facture
              </button>
            </div>
          </form>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .invoice-create-container {
      max-width: 800px;
      margin: 20px auto;
      padding: 20px;
    }

    .full-width {
      width: 100%;
      margin-bottom: 16px;
    }

    .invoice-items-section {
      margin: 24px 0;
    }

    .item-card {
      margin-bottom: 16px;
      padding: 16px;
    }

    .item-row {
      display: flex;
      gap: 16px;
      align-items: flex-start;
    }

    .item-row mat-form-field {
      flex: 1;
    }

    .form-actions {
      display: flex;
      gap: 16px;
      justify-content: flex-end;
      margin-top: 24px;
    }

    mat-spinner {
      margin-right: 8px;
    }
  `]
})
export class InvoiceCreateSimpleComponent implements OnInit {
  invoiceForm!: FormGroup;
  loading = false;

  constructor(
    private fb: FormBuilder,
    private invoiceService: InvoiceService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.initializeForm();
  }

  initializeForm(): void {
    this.invoiceForm = this.fb.group({
      clientId: ['', [Validators.required, Validators.min(1)]],
      dueDate: ['', Validators.required],
      notes: [''],
      invoiceItems: this.fb.array([this.createInvoiceItem()])
    });
  }

  get invoiceItems(): FormArray {
    return this.invoiceForm.get('invoiceItems') as FormArray;
  }

  createInvoiceItem(): FormGroup {
    return this.fb.group({
      designation: ['', Validators.required],
      description: [''],
      quantity: [1, [Validators.required, Validators.min(1)]],
      unitPrice: [0, [Validators.required, Validators.min(0)]]
    });
  }

  addInvoiceItem(): void {
    this.invoiceItems.push(this.createInvoiceItem());
  }

  removeInvoiceItem(index: number): void {
    if (this.invoiceItems.length > 1) {
      this.invoiceItems.removeAt(index);
    }
  }

  onSubmit(): void {
    if (this.invoiceForm.valid) {
      this.loading = true;
      
      const formValue = this.invoiceForm.value;
      const invoiceRequest: InvoiceCreateRequest = {
        clientId: formValue.clientId,
        dueDate: formValue.dueDate.toISOString().split('T')[0],
        notes: formValue.notes,
        invoiceItems: formValue.invoiceItems.map((item: any) => ({
          designation: item.designation,
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.unitPrice
        } as InvoiceItemCreateRequest))
      };

      this.invoiceService.createInvoice(invoiceRequest).subscribe({
        next: (invoice) => {
          this.loading = false;
          this.snackBar.open('Facture créée avec succès', 'Fermer', { duration: 3000 });
          this.router.navigate(['/admin/invoices', invoice.id]);
        },
        error: (error) => {
          this.loading = false;
          this.snackBar.open('Erreur lors de la création de la facture', 'Fermer', { duration: 3000 });
          console.error('Erreur:', error);
        }
      });
    }
  }

  onCancel(): void {
    this.router.navigate(['/admin/invoices']);
  }
}
