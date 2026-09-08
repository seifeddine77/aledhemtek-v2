package com.aledhemtek.services;

import com.aledhemtek.model.Invoice;
import com.aledhemtek.model.Payment;
import com.aledhemtek.repositories.InvoiceRepository;
import com.aledhemtek.repositories.PaymentRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.ArrayList;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PaymentProcessingServiceTest {

    @Mock
    private PaymentRepository paymentRepository;

    @Mock
    private InvoiceRepository invoiceRepository;

    @Mock
    private EmailService emailService;

    @InjectMocks
    private PaymentProcessingService paymentProcessingService;

    private Invoice invoice;

    @BeforeEach
    void setUp() {
        invoice = new Invoice();
        invoice.setId(1L);
        invoice.setInvoiceNumber("INV-2026-001");
        invoice.setTotalAmount(100.0);
        invoice.setPayments(new ArrayList<>());
        invoice.setStatus(Invoice.InvoiceStatus.ISSUED);
    }

    @Test
    void testFullCashPaymentMarksInvoiceAsPaid() {
        when(paymentRepository.save(any(Payment.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Payment payment = paymentProcessingService.processCashPayment(invoice, 100.0, "Paid in full");

        assertNotNull(payment);
        assertEquals(Payment.PaymentStatus.VALIDATED, payment.getStatus());
        assertEquals(Invoice.InvoiceStatus.PAID, invoice.getStatus());
        verify(invoiceRepository, times(1)).save(invoice);
        verify(emailService, times(1)).sendPaymentConfirmationEmail(invoice);
    }

    @Test
    void testPartialCashPaymentDoesNotMarkInvoiceAsPaid() {
        when(paymentRepository.save(any(Payment.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Payment payment = paymentProcessingService.processCashPayment(invoice, 40.0, "Partial deposit");

        assertNotNull(payment);
        assertEquals(Payment.PaymentStatus.VALIDATED, payment.getStatus());
        assertNotEquals(Invoice.InvoiceStatus.PAID, invoice.getStatus());
        verify(invoiceRepository, never()).save(invoice);
        verify(emailService, times(1)).sendPaymentConfirmationEmail(invoice);
    }

    @Test
    void testBankTransferValidationFullPaymentMarksInvoiceAsPaid() {
        Payment pendingPayment = new Payment();
        pendingPayment.setId(10L);
        pendingPayment.setInvoice(invoice);
        pendingPayment.setAmount(100.0);
        pendingPayment.setPaymentMethod(Payment.PaymentMethod.BANK_TRANSFER);
        pendingPayment.setStatus(Payment.PaymentStatus.PENDING);

        when(paymentRepository.findById(10L)).thenReturn(Optional.of(pendingPayment));
        when(paymentRepository.save(any(Payment.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Payment validated = paymentProcessingService.validateBankTransferPayment(10L, true, "Transfer received");

        assertEquals(Payment.PaymentStatus.VALIDATED, validated.getStatus());
        assertEquals(Invoice.InvoiceStatus.PAID, invoice.getStatus());
        verify(invoiceRepository, times(1)).save(invoice);
        verify(emailService, times(1)).sendPaymentConfirmationEmail(invoice);
    }
}
