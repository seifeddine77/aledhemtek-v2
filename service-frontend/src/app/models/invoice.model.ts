export interface Invoice {
  id?: number;
  invoiceNumber: string;
  issueDate: string;
  dueDate: string;
  totalAmount: number;
  taxAmount?: number;
  taxRate?: number;
  discountAmount?: number;
  discountRate?: number;
  status: InvoiceStatus;
  notes?: string;
  pdfPath?: string;
  clientId: number;
  clientName?: string;
  clientEmail?: string;
  clientPhone?: string;
  reservationId?: number;
  reservationTitle?: string;
  invoiceItems: InvoiceItem[];
  payments: Payment[];
  createdAt?: string;
  updatedAt?: string;
}

export interface InvoiceItem {
  id?: number;
  designation: string;
  description?: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  taxRate?: number;
  taxAmount?: number;
  taskId?: number;
  taskName?: string;
}

export interface Payment {
  id?: number;
  paymentReference: string;
  amount: number;
  paymentDate: string;
  paymentMethod: PaymentMethod;
  status: PaymentStatus;
  transactionId?: string;
  notes?: string;
  invoiceId: number;
}

export enum InvoiceStatus {
  DRAFT = 'DRAFT',
  PENDING = 'PENDING',
  SENT = 'SENT',
  PAID = 'PAID',
  OVERDUE = 'OVERDUE',
  CANCELLED = 'CANCELLED'
}

export enum PaymentMethod {
  CASH = 'CASH',
  CREDIT_CARD = 'CREDIT_CARD',
  BANK_TRANSFER = 'BANK_TRANSFER',
  CHECK = 'CHECK',
  PAYPAL = 'PAYPAL',
  OTHER = 'OTHER'
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED'
}

export interface InvoiceCreateRequest {
  clientId: number;
  reservationId?: number;
  dueDate: string;
  notes?: string;
  invoiceItems: InvoiceItemCreateRequest[];
}

export interface InvoiceItemCreateRequest {
  designation: string;
  description?: string;
  quantity: number;
  unitPrice: number;
  taxRate?: number;
  taskId?: number;
}

export interface PaymentCreateRequest {
  amount: number;
  paymentMethod: PaymentMethod;
  transactionId?: string;
  notes?: string;
}

export interface InvoiceFilter {
  search?: string;
  status?: InvoiceStatus;
  clientId?: number;
  startDate?: string;
  endDate?: string;
  minAmount?: number;
  maxAmount?: number;
}

export interface InvoiceStatistics {
  totalInvoices: number;
  totalAmount: number;
  paidAmount: number;
  pendingAmount: number;
  overdueAmount: number;
  averageAmount: number;
  statusDistribution: { [key in InvoiceStatus]: number };
}
