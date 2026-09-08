package com.aledhemtek.services;

import com.aledhemtek.model.Invoice;
import com.aledhemtek.model.Payment;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.time.LocalDateTime;
import java.util.ArrayList;

import static org.junit.jupiter.api.Assertions.*;

class InvoiceCalculationTest {

    private Invoice invoice;

    @BeforeEach
    void setUp() {
        invoice = new Invoice();
        invoice.setId(1L);
        invoice.setInvoiceNumber("INV-2026-TEST");
        invoice.setTotalAmount(250.0);
        invoice.setStatus(Invoice.InvoiceStatus.SENT);
        invoice.setPayments(new ArrayList<>());
    }

    @Test
    void testRemainingAmountWithoutPayments() {
        assertEquals(250.0, invoice.getRemainingAmount());
    }

    @Test
    void testRemainingAmountWithValidatedPayments() {
        Payment p1 = new Payment();
        p1.setAmount(100.0);
        p1.setStatus(Payment.PaymentStatus.VALIDATED);

        Payment p2 = new Payment();
        p2.setAmount(50.0);
        p2.setStatus(Payment.PaymentStatus.VALIDATED);

        invoice.getPayments().add(p1);
        invoice.getPayments().add(p2);

        assertEquals(100.0, invoice.getRemainingAmount());
    }

    @Test
    void testRemainingAmountIgnoresPendingPayments() {
        Payment validated = new Payment();
        validated.setAmount(50.0);
        validated.setStatus(Payment.PaymentStatus.VALIDATED);

        Payment pending = new Payment();
        pending.setAmount(200.0);
        pending.setStatus(Payment.PaymentStatus.PENDING);

        Payment failed = new Payment();
        failed.setAmount(200.0);
        failed.setStatus(Payment.PaymentStatus.FAILED);

        invoice.getPayments().add(validated);
        invoice.getPayments().add(pending);
        invoice.getPayments().add(failed);

        assertEquals(200.0, invoice.getRemainingAmount());
    }

    @Test
    void testRemainingAmountNullSafe() {
        Invoice nullInvoice = new Invoice();
        nullInvoice.setTotalAmount(null);
        nullInvoice.setPayments(null);

        assertEquals(0.0, nullInvoice.getRemainingAmount());
    }

    @Test
    void testIsOverdueWhenDueDatePast() {
        invoice.setDueDate(LocalDateTime.now().minusDays(2));
        invoice.setStatus(Invoice.InvoiceStatus.SENT);

        assertTrue(invoice.isOverdue());

        // When paid, it is no longer considered overdue
        invoice.setStatus(Invoice.InvoiceStatus.PAID);
        assertFalse(invoice.isOverdue());
    }
}
