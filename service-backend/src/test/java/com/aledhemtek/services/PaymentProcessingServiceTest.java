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
        invoice.setStatus(Invoice.InvoiceStatus.SENT);
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
    void testNegativeAmountRejected() {
        assertThrows(IllegalArgumentException.class, () -> {
            paymentProcessingService.processCreditCardPayment(invoice, -10.0, "tok_123", "key-neg");
        });
    }

    @Test
    void testZeroAmountRejected() {
        assertThrows(IllegalArgumentException.class, () -> {
            paymentProcessingService.processCreditCardPayment(invoice, 0.0, "tok_123", "key-zero");
        });
    }

    @Test
    void testAmountGreaterThanRemainingRejected() {
        assertThrows(IllegalArgumentException.class, () -> {
            paymentProcessingService.processCreditCardPayment(invoice, 150.0, "tok_123", "key-over");
        });
    }

    @Test
    void testPaymentOnAlreadyPaidInvoiceRejected() {
        invoice.setStatus(Invoice.InvoiceStatus.PAID);
        assertThrows(IllegalStateException.class, () -> {
            paymentProcessingService.processCreditCardPayment(invoice, 50.0, "tok_123", "key-paid");
        });
    }

    @Test
    void testIdempotencyReturnsExistingPaymentWithoutDoubleProcessing() {
        Payment existing = new Payment();
        existing.setId(99L);
        existing.setIdempotencyKey("idem-unique-123");
        existing.setAmount(50.0);
        existing.setStatus(Payment.PaymentStatus.VALIDATED);
        existing.setInvoice(invoice);

        when(paymentRepository.findByIdempotencyKey("idem-unique-123")).thenReturn(Optional.of(existing));

        Payment result = paymentProcessingService.processCreditCardPayment(invoice, 50.0, "tok_123", "idem-unique-123");

        assertNotNull(result);
        assertEquals(99L, result.getId());
        assertEquals("idem-unique-123", result.getIdempotencyKey());
        verify(paymentRepository, never()).save(any(Payment.class));
    }

    @Test
    void testRefundPaymentReopensInvoiceToSent() {
        invoice.setStatus(Invoice.InvoiceStatus.PAID);
        Payment validatedPayment = new Payment();
        validatedPayment.setId(20L);
        validatedPayment.setInvoice(invoice);
        validatedPayment.setAmount(100.0);
        validatedPayment.setStatus(Payment.PaymentStatus.VALIDATED);
        invoice.getPayments().add(validatedPayment);

        when(paymentRepository.findById(20L)).thenReturn(Optional.of(validatedPayment));
        when(paymentRepository.save(any(Payment.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Payment refunded = paymentProcessingService.refundPayment(20L, "Client requested refund");

        assertEquals(Payment.PaymentStatus.REFUNDED, refunded.getStatus());
        assertEquals(Invoice.InvoiceStatus.SENT, invoice.getStatus());
        verify(invoiceRepository, times(1)).save(invoice);
    }
}
