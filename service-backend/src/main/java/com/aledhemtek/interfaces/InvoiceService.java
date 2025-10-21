package com.aledhemtek.interfaces;

import com.aledhemtek.model.Invoice;
import com.aledhemtek.model.InvoiceItem;
import com.aledhemtek.model.Payment;
import com.aledhemtek.model.Reservation;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface InvoiceService {
    
    /**
     * Create a new invoice
     */
    Invoice createInvoice(Invoice invoice);
    
    /**
     * Create invoice from reservation
     */
    Invoice createInvoiceFromReservation(Reservation reservation);
    
    /**
     * Update an existing invoice
     */
    Invoice updateInvoice(Invoice invoice);
    
    /**
     * Get invoice by ID
     */
    Optional<Invoice> getInvoiceById(Long id);
    
    /**
     * Get invoice by ID with all details (items, payments, etc.)
     */
    Optional<Invoice> getInvoiceWithDetailsById(Long id);
    
    /**
     * Get invoice by invoice number
     */
    Optional<Invoice> getInvoiceByNumber(String invoiceNumber);
    
    /**
     * Get all invoices with pagination
     */
    Page<Invoice> getAllInvoices(Pageable pageable);
    
    /**
     * Get invoices by status
     */
    List<Invoice> getInvoicesByStatus(Invoice.InvoiceStatus status);
    
    /**
     * Get invoices by client ID
     */
    List<Invoice> getInvoicesByClientId(Long clientId);
    
    /**
     * Get invoices by reservation ID
     */
    List<Invoice> getInvoicesByReservationId(Long reservationId);
    
    /**
     * Get invoice by reservation ID (single result)
     */
    Optional<Invoice> getInvoiceByReservationId(Long reservationId);
    
    /**
     * Search invoices
     */
    Page<Invoice> searchInvoices(String searchTerm, Pageable pageable);
    
    /**
     * Get overdue invoices
     */
    List<Invoice> getOverdueInvoices();
    
    /**
     * Get unpaid invoices
     */
    List<Invoice> getUnpaidInvoices();
    
    /**
     * Get recent invoices (last 30 days)
     */
    List<Invoice> getRecentInvoices();
    
    /**
     * Add item to invoice
     */
    Invoice addItemToInvoice(Long invoiceId, InvoiceItem item);
    
    /**
     * Remove item from invoice
     */
    Invoice removeItemFromInvoice(Long invoiceId, Long itemId);
    
    /**
     * Update invoice item
     */
    Invoice updateInvoiceItem(Long invoiceId, InvoiceItem item);
    
    /**
     * Add payment to invoice
     */
    Invoice addPaymentToInvoice(Long invoiceId, Payment payment);
    
    /**
     * Mark invoice as sent
     */
    Invoice markInvoiceAsSent(Long invoiceId);
    
    /**
     * Mark invoice as paid
     */
    Invoice markInvoiceAsPaid(Long invoiceId);
    
    /**
     * Cancel invoice
     */
    Invoice cancelInvoice(Long invoiceId);
    
    /**
     * Generate PDF for invoice
     */
    byte[] generateInvoicePDF(Long invoiceId);
    
    /**
     * Send invoice by email
     */
    boolean sendInvoiceByEmail(Long invoiceId, String emailAddress);
    
    /**
     * Calculate invoice totals
     */
    Invoice calculateInvoiceTotals(Long invoiceId);
    
    /**
     * Delete invoice
     */
    void deleteInvoice(Long invoiceId);
    
    /**
     * Get monthly revenue
     */
    Double getMonthlyRevenue(int year, int month);
    
    /**
     * Get yearly revenue
     */
    Double getYearlyRevenue(int year);
    
    /**
     * Get total amount for client
     */
    Double getTotalAmountByClientId(Long clientId);
    
    /**
     * Get unpaid amount for client
     */
    Double getUnpaidAmountByClientId(Long clientId);
    
    /**
     * Count invoices by status
     */
    Long countInvoicesByStatus(Invoice.InvoiceStatus status);
    
    /**
     * Get invoices by date range
     */
    List<Invoice> getInvoicesByDateRange(LocalDateTime startDate, LocalDateTime endDate);
    
    /**
     * Get invoices by due date range
     */
    List<Invoice> getInvoicesByDueDateRange(LocalDateTime startDate, LocalDateTime endDate);
    
    /**
     * Update overdue invoices status
     */
    void updateOverdueInvoicesStatus();
    
    /**
     * Generate invoice number
     */
    String generateInvoiceNumber();
    
    /**
     * Check if invoice is owned by client
     */
    boolean isInvoiceOwnedByClient(Long invoiceId, Long clientId);
}
