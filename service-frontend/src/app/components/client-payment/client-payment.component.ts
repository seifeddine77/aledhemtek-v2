import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatRadioModule } from '@angular/material/radio';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatDividerModule } from '@angular/material/divider';
import { MatStepperModule } from '@angular/material/stepper';
import { ClientInvoiceService, ClientInvoice } from '../../services/client-invoice.service';
import { PaymentService, PaymentRequest, PaymentResponse } from '../../services/payment.service';
import { AuthService } from '../../services/auth.service';

interface Invoice {
  id: number;
  invoiceNumber: string;
  totalAmount: number;
  status: string;
  dueDate: string;
  clientName?: string;
  clientId?: number;
}

interface PaymentMethod {
  id: string;
  name: string;
  icon: string;
  description: string;
  enabled: boolean;
}

@Component({
  selector: 'app-client-payment',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatRadioModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatDividerModule,
    MatStepperModule
  ],
  templateUrl: './client-payment.component.html',
  styleUrls: ['./client-payment.component.css']
})
export class ClientPaymentComponent implements OnInit {
  invoice: Invoice | null = null;
  loading = false;
  processing = false;
  invoiceId: number = 0;
  
  paymentForm: FormGroup;
  cardForm: FormGroup;
  
  selectedPaymentMethod = '';
  
  paymentMethods: PaymentMethod[] = [
    {
      id: 'stripe',
      name: 'Carte bancaire',
      icon: 'credit_card',
      description: 'Paiement sécurisé par carte bancaire via Stripe',
      enabled: true
    },
    {
      id: 'paypal',
      name: 'PayPal',
      icon: 'account_balance_wallet',
      description: 'Paiement via votre compte PayPal',
      enabled: true
    },
    {
      id: 'bank_transfer',
      name: 'Virement bancaire',
      icon: 'account_balance',
      description: 'Virement bancaire (validation manuelle)',
      enabled: true
    },
    {
      id: 'cash',
      name: 'Espèces',
      icon: 'payments',
      description: 'Paiement en espèces (à déclarer)',
      enabled: true
    },
    {
      id: 'check',
      name: 'Chèque',
      icon: 'receipt',
      description: 'Paiement par chèque (à déclarer)',
      enabled: true
    }
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    private invoiceService: ClientInvoiceService,
    private paymentService: PaymentService,
    private authService: AuthService,
    private snackBar: MatSnackBar
  ) {
    this.paymentForm = this.fb.group({
      paymentMethod: ['', Validators.required],
      amount: [{ value: 0, disabled: true }]
    });

    this.cardForm = this.fb.group({
      cardNumber: ['', [Validators.required, Validators.pattern(/^\d{16}$/)]],
      expiryMonth: ['', [Validators.required, Validators.min(1), Validators.max(12)]],
      expiryYear: ['', [Validators.required, Validators.min(new Date().getFullYear())]],
      cvv: ['', [Validators.required, Validators.pattern(/^\d{3,4}$/)]],
      cardholderName: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.invoiceId = +params['id'];
      if (this.invoiceId) {
        this.loadInvoiceForPayment();
      }
    });
  }

  loadInvoiceForPayment(): void {
    this.loading = true;
    
    this.invoiceService.getInvoiceById(this.invoiceId).subscribe({
      next: (invoice: ClientInvoice) => {
        // Vérifier que cette facture appartient bien au client connecté
        const currentUserId = this.authService.getCurrentUserId();
        if (currentUserId && (invoice as any).clientId === currentUserId) {
          this.invoice = {
            id: invoice.id!,
            invoiceNumber: invoice.invoiceNumber!,
            totalAmount: invoice.totalAmount,
            status: invoice.status,
            dueDate: invoice.dueDate.toString(),
            clientName: invoice.clientName,
            clientId: (invoice as any).clientId
          };
          this.paymentForm.patchValue({
            amount: invoice.totalAmount
          });
        } else {
          this.snackBar.open('Accès non autorisé à cette facture', 'Fermer', {
            duration: 3000
          });
          this.router.navigate(['/client/invoices']);
        }
        this.loading = false;
      },
      error: (error: any) => {
        console.error('Error loading invoice:', error);
        this.snackBar.open('Erreur lors du chargement de la facture', 'Fermer', {
          duration: 3000
        });
        this.loading = false;
        this.router.navigate(['/client/invoices']);
      }
    });
  }

  onPaymentMethodChange(): void {
    this.selectedPaymentMethod = this.paymentForm.get('paymentMethod')?.value || '';
  }

  processPayment(): void {
    if (!this.invoice || !this.paymentForm.valid) {
      this.snackBar.open('Veuillez sélectionner une méthode de paiement', 'Fermer', {
        duration: 3000
      });
      return;
    }

    if (this.selectedPaymentMethod === 'stripe' && !this.cardForm.valid) {
      this.snackBar.open('Veuillez remplir correctement les informations de carte', 'Fermer', {
        duration: 3000
      });
      return;
    }

    this.processing = true;

    const paymentData = {
      invoiceId: this.invoice.id,
      amount: this.invoice.totalAmount,
      paymentMethod: this.selectedPaymentMethod,
      cardDetails: this.selectedPaymentMethod === 'stripe' ? this.cardForm.value : null
    };

    this.paymentService.processPayment(paymentData).subscribe({
      next: (response: PaymentResponse) => {
        this.processing = false;
        
        if (response.success) {
          this.snackBar.open('Paiement effectué avec succès !', 'Fermer', {
            duration: 5000
          });
          
          // Rediriger vers le détail de la facture
          this.router.navigate(['/client/invoices', this.invoice!.id]);
        } else {
          this.snackBar.open(response.message || 'Erreur lors du paiement', 'Fermer', {
            duration: 5000
          });
        }
      },
      error: (error: any) => {
        console.error('Payment error:', error);
        this.processing = false;
        this.snackBar.open('Erreur lors du traitement du paiement', 'Fermer', {
          duration: 5000
        });
      }
    });
  }

  payWithStripe(): void {
    if (!this.cardForm.valid) {
      this.snackBar.open('Veuillez remplir correctement les informations de carte', 'Fermer', {
        duration: 3000
      });
      return;
    }
    
    this.paymentForm.patchValue({ paymentMethod: 'stripe' });
    this.processPayment();
  }

  payWithPayPal(): void {
    this.paymentForm.patchValue({ paymentMethod: 'paypal' });
    
    // Simulation de redirection PayPal
    this.snackBar.open('Redirection vers PayPal...', 'Fermer', {
      duration: 3000
    });
    
    // Dans un vrai cas, on redirigerait vers PayPal
    setTimeout(() => {
      this.processPayment();
    }, 2000);
  }

  requestBankTransfer(): void {
    this.paymentForm.patchValue({ paymentMethod: 'bank_transfer' });
    this.processPayment();
  }

  declareCashPayment(): void {
    this.paymentForm.patchValue({ paymentMethod: 'cash' });
    this.snackBar.open('Déclaration de paiement en espèces en cours...', 'Fermer', {
      duration: 3000
    });
    this.processOfflinePayment('cash');
  }

  declareCheckPayment(): void {
    this.paymentForm.patchValue({ paymentMethod: 'check' });
    this.snackBar.open('Déclaration de paiement par chèque en cours...', 'Fermer', {
      duration: 3000
    });
    this.processOfflinePayment('check');
  }

  processOfflinePayment(method: string): void {
    if (!this.invoice) return;

    this.processing = true;

    const paymentData = {
      invoiceId: this.invoice.id,
      amount: this.invoice.totalAmount,
      paymentMethod: method,
      status: 'PENDING_VALIDATION', // Statut en attente de validation
      notes: method === 'cash' ? 'Paiement en espèces déclaré par le client' : 'Paiement par chèque déclaré par le client'
    };

    this.paymentService.processPayment(paymentData).subscribe({
      next: (response: PaymentResponse) => {
        this.processing = false;
        
        if (response.success) {
          const methodName = method === 'cash' ? 'en espèces' : 'par chèque';
          this.snackBar.open(`Paiement ${methodName} déclaré avec succès ! En attente de validation par l'administrateur.`, 'Fermer', {
            duration: 7000
          });
          
          // Rediriger vers le détail de la facture
          this.router.navigate(['/client/invoices', this.invoice!.id]);
        } else {
          this.snackBar.open(response.message || 'Erreur lors de la déclaration du paiement', 'Fermer', {
            duration: 5000
          });
        }
      },
      error: (error: any) => {
        console.error('Payment declaration error:', error);
        this.processing = false;
        this.snackBar.open('Erreur lors de la déclaration du paiement', 'Fermer', {
          duration: 5000
        });
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/client/invoices', this.invoiceId]);
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  }

  formatDate(dateString: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR');
  }

  // Validation helpers
  getCardNumberError(): string {
    const control = this.cardForm.get('cardNumber');
    if (control?.hasError('required')) return 'Numéro de carte requis';
    if (control?.hasError('pattern')) return 'Numéro de carte invalide (16 chiffres)';
    return '';
  }

  getCvvError(): string {
    const control = this.cardForm.get('cvv');
    if (control?.hasError('required')) return 'CVV requis';
    if (control?.hasError('pattern')) return 'CVV invalide (3-4 chiffres)';
    return '';
  }

  getExpiryError(): string {
    const month = this.cardForm.get('expiryMonth');
    const year = this.cardForm.get('expiryYear');
    
    if (month?.hasError('required') || year?.hasError('required')) {
      return 'Date d\'expiration requise';
    }
    if (month?.hasError('min') || month?.hasError('max')) {
      return 'Mois invalide (1-12)';
    }
    if (year?.hasError('min')) {
      return 'Année invalide';
    }
    return '';
  }
}
