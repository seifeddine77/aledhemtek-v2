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
import { MatTooltipModule } from '@angular/material/tooltip';

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
    MatProgressSpinnerModule,
    MatTooltipModule
  ],
  template: `
    <div class="invoice-container-modern">
      <div class="form-card-modern">
        <div class="form-header-modern">
          <div class="header-icon-badge">
            <mat-icon>receipt_long</mat-icon>
          </div>
          <div>
            <h2>Création d'une nouvelle facture</h2>
            <p>Émettez une facture professionnelle avec ventilation des lignes et échéancier</p>
          </div>
        </div>

        <form [formGroup]="invoiceForm" (ngSubmit)="onSubmit()" class="invoice-form-body">
          <!-- Section Informations Facture -->
          <div class="form-section-modern">
            <div class="section-title">
              <mat-icon>business</mat-icon>
              <span>Destinataire et Échéance</span>
            </div>

            <div class="form-grid-2">
              <mat-form-field appearance="outline" class="w-100">
                <mat-label>Identifiant Client</mat-label>
                <mat-icon matPrefix>person</mat-icon>
                <input matInput type="number" formControlName="clientId" placeholder="Ex: 1" required>
                <mat-error *ngIf="invoiceForm.get('clientId')?.hasError('required')">
                  L'identifiant du client est obligatoire
                </mat-error>
              </mat-form-field>

              <mat-form-field appearance="outline" class="w-100">
                <mat-label>Date d'échéance</mat-label>
                <input matInput [matDatepicker]="picker" formControlName="dueDate" placeholder="JJ/MM/AAAA" required>
                <mat-datepicker-toggle matSuffix [for]="picker"></mat-datepicker-toggle>
                <mat-datepicker #picker></mat-datepicker>
                <mat-error *ngIf="invoiceForm.get('dueDate')?.hasError('required')">
                  La date d'échéance est obligatoire
                </mat-error>
              </mat-form-field>
            </div>

            <mat-form-field appearance="outline" class="w-100 mt-2">
              <mat-label>Notes & Conditions particulières (optionnel)</mat-label>
              <mat-icon matPrefix>notes</mat-icon>
              <textarea matInput formControlName="notes" rows="2" placeholder="Ex: Règlement à 30 jours, TVA non applicable art. 293 B du CGI..."></textarea>
            </mat-form-field>
          </div>

          <!-- Section Lignes de prestation -->
          <div class="form-section-modern">
            <div class="section-header-row">
              <div class="section-title">
                <mat-icon>format_list_bulleted</mat-icon>
                <span>Lignes de facturation ({{ invoiceItems.length }})</span>
              </div>
              <button mat-stroked-button color="primary" type="button" (click)="addInvoiceItem()">
                <mat-icon>add</mat-icon>
                Ajouter une prestation
              </button>
            </div>

            <div formArrayName="invoiceItems" class="items-list">
              <div *ngFor="let item of invoiceItems.controls; let i = index" [formGroupName]="i" class="item-card-modern">
                <div class="item-header">
                  <span class="item-index-badge">#{{ i + 1 }}</span>
                  <span class="item-calc-preview" *ngIf="getItemTotal(item) > 0">
                    Total ligne : <strong>{{ getItemTotal(item) | number:'1.2-2' }} € HT</strong>
                  </span>
                  <button mat-icon-button color="warn" type="button" (click)="removeInvoiceItem(i)" [disabled]="invoiceItems.length === 1" matTooltip="Supprimer cette ligne">
                    <mat-icon>delete_outline</mat-icon>
                  </button>
                </div>

                <div class="item-fields-grid">
                  <mat-form-field appearance="outline" class="w-100 grid-span-2">
                    <mat-label>Désignation de la prestation / matériel</mat-label>
                    <mat-icon matPrefix>edit</mat-icon>
                    <input matInput formControlName="designation" placeholder="Ex: Remplacement tableau électrique" required>
                  </mat-form-field>

                  <mat-form-field appearance="outline" class="w-100">
                    <mat-label>Quantité</mat-label>
                    <input matInput type="number" formControlName="quantity" min="1" required>
                  </mat-form-field>

                  <mat-form-field appearance="outline" class="w-100">
                    <mat-label>Prix unitaire HT (€)</mat-label>
                    <input matInput type="number" step="0.5" min="0" formControlName="unitPrice" required>
                    <span matSuffix class="field-currency">EUR</span>
                  </mat-form-field>
                </div>

                <mat-form-field appearance="outline" class="w-100 mt-2">
                  <mat-label>Description ou détail technique (optionnel)</mat-label>
                  <textarea matInput formControlName="description" rows="1" placeholder="Détails complémentaires..."></textarea>
                </mat-form-field>
              </div>
            </div>
          </div>

          <!-- Récapitulatif financier -->
          <div class="invoice-summary-card">
            <div class="summary-line">
              <span>Total HT :</span>
              <span class="summary-val">{{ getTotalHT() | number:'1.2-2' }} €</span>
            </div>
            <div class="summary-line">
              <span>TVA estimée (20%) :</span>
              <span class="summary-val">{{ getTotalHT() * 0.20 | number:'1.2-2' }} €</span>
            </div>
            <div class="summary-line total-ttc">
              <span>Total TTC :</span>
              <span class="summary-val-highlight">{{ getTotalHT() * 1.20 | number:'1.2-2' }} €</span>
            </div>
          </div>

          <!-- Actions -->
          <div class="form-actions-modern">
            <button mat-button type="button" (click)="onCancel()" class="btn-cancel">
              Annuler
            </button>
            <button mat-raised-button color="primary" type="submit" [disabled]="invoiceForm.invalid || loading" class="btn-submit">
              <mat-spinner *ngIf="loading" diameter="20" class="spinner-inline"></mat-spinner>
              <mat-icon *ngIf="!loading">save</mat-icon>
              Créer et émettre la facture
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .invoice-container-modern {
      max-width: 900px;
      margin: 2.5rem auto 4rem;
      padding: 0 1rem;
    }

    .invoice-form-body {
      padding: 2rem;
      display: flex;
      flex-direction: column;
      gap: 2rem;
    }

    .form-section-modern {
      background: var(--color-surface, #ffffff);
      border: 1px solid var(--color-border-subtle, #f1f5f9);
      border-radius: var(--radius-lg, 12px);
      padding: 1.5rem;
      box-shadow: var(--shadow-sm, 0 1px 3px rgba(0, 0, 0, 0.05));
    }

    .section-title {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 1.1rem;
      font-weight: 700;
      color: var(--color-text-primary, #0f172a);
      margin-bottom: 1.25rem;
    }

    .section-title mat-icon {
      color: var(--color-primary, #2563eb);
      font-size: 20px;
      width: 20px;
      height: 20px;
    }

    .section-header-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 1.25rem;
      flex-wrap: wrap;
      gap: 0.75rem;
    }

    .section-header-row .section-title {
      margin-bottom: 0;
    }

    .items-list {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .item-card-modern {
      background: #f8fafc;
      border: 1px solid var(--color-border, #e2e8f0);
      border-radius: 10px;
      padding: 1.25rem;
    }

    .item-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 0.75rem;
    }

    .item-index-badge {
      display: inline-block;
      font-size: 0.8rem;
      font-weight: 700;
      padding: 0.2rem 0.6rem;
      border-radius: 6px;
      background: #e2e8f0;
      color: #334155;
    }

    .item-calc-preview {
      font-size: 0.85rem;
      color: var(--color-text-secondary, #475569);
    }

    .item-calc-preview strong {
      color: var(--color-primary, #2563eb);
    }

    .item-fields-grid {
      display: grid;
      grid-template-columns: 2fr 1fr 1fr;
      gap: 0.75rem;
    }

    .field-currency {
      font-size: 0.85rem;
      font-weight: 600;
      color: var(--color-text-muted, #64748b);
      margin-right: 8px;
    }

    .invoice-summary-card {
      background: #f1f5f9;
      border-radius: 12px;
      padding: 1.25rem 1.5rem;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      max-width: 380px;
      margin-left: auto;
      border: 1px solid var(--color-border, #e2e8f0);
    }

    .summary-line {
      display: flex;
      justify-content: space-between;
      font-size: 0.95rem;
      color: var(--color-text-secondary, #475569);
    }

    .summary-line.total-ttc {
      border-top: 2px solid var(--color-border, #cbd5e1);
      padding-top: 0.5rem;
      margin-top: 0.25rem;
      font-size: 1.15rem;
      font-weight: 800;
      color: var(--color-text-primary, #0f172a);
    }

    .summary-val-highlight {
      color: var(--color-primary, #2563eb);
    }

    .spinner-inline {
      display: inline-block;
      margin-right: 8px;
    }

    .w-100 {
      width: 100%;
    }

    .mt-2 {
      margin-top: 0.5rem;
    }

    @media (max-width: 640px) {
      .invoice-form-body {
        padding: 1.25rem 1rem;
      }
      .item-fields-grid {
        grid-template-columns: 1fr;
      }
      .invoice-summary-card {
        max-width: 100%;
      }
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

  getItemTotal(item: any): number {
    const qty = Number(item.get('quantity')?.value) || 0;
    const price = Number(item.get('unitPrice')?.value) || 0;
    return qty * price;
  }

  getTotalHT(): number {
    if (!this.invoiceItems) return 0;
    return this.invoiceItems.controls.reduce((acc, ctrl) => {
      const qty = Number(ctrl.get('quantity')?.value) || 0;
      const price = Number(ctrl.get('unitPrice')?.value) || 0;
      return acc + (qty * price);
    }, 0);
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
