import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
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
import { PaymentMethod, PaymentCreateRequest } from '../../../models/invoice.model';

export interface PaymentDialogData {
  invoiceId: number;
  remainingAmount: number;
}

@Component({
  selector: 'app-payment-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
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
  templateUrl: './payment-dialog.component.html',
  styleUrl: './payment-dialog.component.css'
})
export class PaymentDialogComponent implements OnInit {
  paymentForm!: FormGroup;
  loading = false;
  paymentMethods = Object.values(PaymentMethod);

  constructor(
    private fb: FormBuilder,
    private invoiceService: InvoiceService,
    private snackBar: MatSnackBar,
    public dialogRef: MatDialogRef<PaymentDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: PaymentDialogData
  ) {}

  ngOnInit(): void {
    this.initializeForm();
  }

  initializeForm(): void {
    this.paymentForm = this.fb.group({
      amount: [this.data.remainingAmount, [Validators.required, Validators.min(0.01), Validators.max(this.data.remainingAmount)]],
      paymentMethod: [PaymentMethod.CASH, Validators.required],
      paymentDate: [new Date(), Validators.required],
      transactionId: [''],
      notes: ['']
    });
  }

  getPaymentMethodLabel(method: PaymentMethod): string {
    switch (method) {
      case PaymentMethod.CASH:
        return 'Espèces';
      case PaymentMethod.CREDIT_CARD:
        return 'Carte bancaire';
      case PaymentMethod.BANK_TRANSFER:
        return 'Virement bancaire';
      case PaymentMethod.CHECK:
        return 'Chèque';
      case PaymentMethod.PAYPAL:
        return 'PayPal';
      case PaymentMethod.OTHER:
        return 'Autre';
      default:
        return method;
    }
  }

  onSubmit(): void {
    if (this.paymentForm.valid) {
      this.loading = true;
      
      const formValue = this.paymentForm.value;
      const paymentRequest: PaymentCreateRequest = {
        amount: formValue.amount,
        paymentMethod: formValue.paymentMethod,
        transactionId: formValue.transactionId || undefined,
        notes: formValue.notes || undefined
      };

      this.invoiceService.addPaymentToInvoice(this.data.invoiceId, paymentRequest).subscribe({
        next: (payment) => {
          this.snackBar.open('Paiement ajouté avec succès', 'Fermer', { 
            duration: 3000,
            panelClass: ['success-snackbar']
          });
          this.dialogRef.close(true);
        },
        error: (error) => {
          console.error('Error adding payment:', error);
          this.snackBar.open('Erreur lors de l\'ajout du paiement', 'Fermer', { 
            duration: 3000,
            panelClass: ['error-snackbar']
          });
          this.loading = false;
        }
      });
    } else {
      this.markFormGroupTouched();
    }
  }

  private markFormGroupTouched(): void {
    Object.keys(this.paymentForm.controls).forEach(key => {
      const control = this.paymentForm.get(key);
      control?.markAsTouched();
    });
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }

  onAmountChange(): void {
    const amount = this.paymentForm.get('amount')?.value;
    if (amount > this.data.remainingAmount) {
      this.paymentForm.get('amount')?.setValue(this.data.remainingAmount);
    }
  }

  setFullAmount(): void {
    this.paymentForm.get('amount')?.setValue(this.data.remainingAmount);
  }

  generateTransactionId(): void {
    const timestamp = Date.now().toString();
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    const transactionId = `TXN-${timestamp.slice(-6)}-${random}`;
    this.paymentForm.get('transactionId')?.setValue(transactionId);
  }
}
