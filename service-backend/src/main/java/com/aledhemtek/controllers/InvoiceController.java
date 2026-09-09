package com.aledhemtek.controllers;

import com.aledhemtek.interfaces.InvoiceService;
import com.aledhemtek.model.Invoice;
import com.aledhemtek.model.InvoiceItem;
import com.aledhemtek.model.Payment;
import com.aledhemtek.services.AutoInvoiceService;
import com.aledhemtek.services.EmailService;
import com.aledhemtek.services.InvoicePDFService;
import com.aledhemtek.repositories.InvoiceRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.access.prepost.PreAuthorize;

import java.time.LocalDateTime;
import java.util.*;
import java.util.Optional;

@RestController
@RequestMapping("/api/invoices")
public class InvoiceController {
    
    @Autowired
    private InvoiceService invoiceService;
    
    @Autowired
    private AutoInvoiceService autoInvoiceService;
    
    @Autowired
    private InvoiceRepository invoiceRepository;

    @Autowired
    private InvoicePDFService invoicePDFService;

    @Autowired
    private EmailService emailService;

    @Autowired
    private com.aledhemtek.services.PaymentProcessingService paymentProcessingService;
    
    /**
     * Create a new invoice
     */
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Invoice> createInvoice(@RequestBody Invoice invoice) {
        try {
            Invoice createdInvoice = invoiceService.createInvoice(invoice);
            return ResponseEntity.status(HttpStatus.CREATED).body(createdInvoice);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }
    
    /**
     * Create invoice from reservation
     */
    @PostMapping("/from-reservation/{reservationId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Invoice> createInvoiceFromReservation(@PathVariable Long reservationId) {
        try {
            // This would need a reservation service to fetch the reservation
            // For now, we'll return a placeholder response
            return ResponseEntity.status(HttpStatus.NOT_IMPLEMENTED).build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }
    
    /**
     * Get all invoices with pagination (PROTECTED ENDPOINT)
     */
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Page<Invoice>> getAllInvoices(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {
        
        Sort sort = sortDir.equalsIgnoreCase("desc") ? 
            Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();
        Pageable pageable = PageRequest.of(page, size, sort);
        
        Page<Invoice> invoices = invoiceService.getAllInvoices(pageable);
        return ResponseEntity.ok(invoices);
    }
    
    /**
     * Get invoice by ID
     */
    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or (hasRole('CLIENT') and @invoiceService.isInvoiceOwnedByClient(#id, authentication.principal.user.id))")
    public ResponseEntity<Invoice> getInvoiceById(@PathVariable Long id) {
        Optional<Invoice> invoice = invoiceService.getInvoiceById(id);
        return invoice.map(ResponseEntity::ok)
                     .orElse(ResponseEntity.notFound().build());
    }
    
    /**
     * Get invoice by number
     */
    @GetMapping("/number/{invoiceNumber}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Invoice> getInvoiceByNumber(@PathVariable String invoiceNumber) {
        Optional<Invoice> invoice = invoiceService.getInvoiceByNumber(invoiceNumber);
        return invoice.map(ResponseEntity::ok)
                     .orElse(ResponseEntity.notFound().build());
    }
    
    /**
     * Update invoice
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Invoice> updateInvoice(@PathVariable Long id, @RequestBody Invoice invoice) {
        try {
            invoice.setId(id);
            Invoice updatedInvoice = invoiceService.updateInvoice(invoice);
            return ResponseEntity.ok(updatedInvoice);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }
    
    /**
     * Delete invoice
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteInvoice(@PathVariable Long id) {
        try {
            invoiceService.deleteInvoice(id);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }
    
    /**
     * Get invoices by status
     */
    @GetMapping("/status/{status}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Invoice>> getInvoicesByStatus(@PathVariable Invoice.InvoiceStatus status) {
        List<Invoice> invoices = invoiceService.getInvoicesByStatus(status);
        return ResponseEntity.ok(invoices);
    }
    
    /**
     * Get invoices by client ID
     */
    @GetMapping("/client/{clientId}")
    @PreAuthorize("hasRole('ADMIN') or (hasRole('CLIENT') and #clientId == authentication.principal.user.id)")
    public ResponseEntity<List<Invoice>> getInvoicesByClientId(@PathVariable Long clientId) {
        List<Invoice> invoices = invoiceService.getInvoicesByClientId(clientId);
        return ResponseEntity.ok(invoices);
    }
    
    /**
     * Search invoices
     */
    @GetMapping("/search")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Page<Invoice>> searchInvoices(
            @RequestParam String searchTerm,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        
        Pageable pageable = PageRequest.of(page, size);
        Page<Invoice> invoices = invoiceService.searchInvoices(searchTerm, pageable);
        return ResponseEntity.ok(invoices);
    }
    
    /**
     * Get overdue invoices
     */
    @GetMapping("/overdue")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Invoice>> getOverdueInvoices() {
        List<Invoice> invoices = invoiceService.getOverdueInvoices();
        return ResponseEntity.ok(invoices);
    }
    
    /**
     * Get unpaid invoices
     */
    @GetMapping("/unpaid")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Invoice>> getUnpaidInvoices() {
        List<Invoice> invoices = invoiceService.getUnpaidInvoices();
        return ResponseEntity.ok(invoices);
    }
    
    /**
     * Get recent invoices
     */
    @GetMapping("/recent")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Invoice>> getRecentInvoices() {
        List<Invoice> invoices = invoiceService.getRecentInvoices();
        return ResponseEntity.ok(invoices);
    }
    
    /**
     * Add item to invoice
     */
    @PostMapping("/{id}/items")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Invoice> addItemToInvoice(@PathVariable Long id, @RequestBody InvoiceItem item) {
        try {
            Invoice updatedInvoice = invoiceService.addItemToInvoice(id, item);
            return ResponseEntity.ok(updatedInvoice);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }
    
    /**
     * Remove item from invoice
     */
    @DeleteMapping("/{id}/items/{itemId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Invoice> removeItemFromInvoice(@PathVariable Long id, @PathVariable Long itemId) {
        try {
            Invoice updatedInvoice = invoiceService.removeItemFromInvoice(id, itemId);
            return ResponseEntity.ok(updatedInvoice);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }
    
    /**
     * Add payment to invoice
     */
    @PostMapping("/{id}/payments")
    @PreAuthorize("hasRole('ADMIN') or hasRole('CLIENT')")
    public ResponseEntity<?> addPaymentToInvoice(@PathVariable Long id, @RequestBody Payment payment) {
        try {
            paymentProcessingService.addPaymentToInvoice(
                id,
                payment.getAmount(),
                payment.getPaymentMethod(),
                payment.getTransactionId(),
                payment.getNotes(),
                payment.getIdempotencyKey()
            );
            return ResponseEntity.ok(invoiceService.getInvoiceById(id).orElse(null));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Delete payment from invoice
     */
    @DeleteMapping("/payments/{paymentId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deletePayment(@PathVariable Long paymentId) {
        try {
            paymentProcessingService.deletePayment(paymentId);
            return ResponseEntity.ok(Map.of("success", true, "message", "Payment deleted successfully"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", e.getMessage()));
        }
    }
    
    /**
     * Mark invoice as sent
     */
    @PutMapping("/{id}/mark-sent")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Invoice> markInvoiceAsSent(@PathVariable Long id) {
        try {
            Invoice updatedInvoice = invoiceService.markInvoiceAsSent(id);
            return ResponseEntity.ok(updatedInvoice);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }
    
    /**
     * Mark invoice as paid
     */
    @PutMapping("/{id}/mark-paid")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Invoice> markInvoiceAsPaid(@PathVariable Long id) {
        try {
            Invoice updatedInvoice = invoiceService.markInvoiceAsPaid(id);
            return ResponseEntity.ok(updatedInvoice);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }
    
    /**
     * Cancel invoice
     */
    @PutMapping("/{id}/cancel")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Invoice> cancelInvoice(@PathVariable Long id) {
        try {
            Invoice updatedInvoice = invoiceService.cancelInvoice(id);
            return ResponseEntity.ok(updatedInvoice);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }
    
    /**
     * Generate PDF for invoice
     */
    @GetMapping("/{id}/pdf")
    @PreAuthorize("hasRole('ADMIN') or hasRole('CONSULTANT') or (hasRole('CLIENT') and @invoiceService.isInvoiceOwnedByClient(#id, authentication.principal.user.id))")
    public ResponseEntity<byte[]> generateInvoicePDF(@PathVariable Long id) {
        try {
            Optional<Invoice> invoiceOpt = invoiceService.getInvoiceById(id);
            if (invoiceOpt.isEmpty()) {
                return ResponseEntity.notFound().build();
            }
            
            Invoice invoice = invoiceOpt.get();
            byte[] pdfBytes = invoicePDFService.generateInvoicePDFBytes(invoice);
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_PDF);
            headers.setContentDispositionFormData("attachment", "facture_" + invoice.getInvoiceNumber() + ".pdf");
            
            return ResponseEntity.ok()
                    .headers(headers)
                    .body(pdfBytes);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    /**
     * Send invoice by email
     */
    @PostMapping("/{id}/send-email")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, String>> sendInvoiceByEmail(
            @PathVariable Long id, 
            @RequestBody Map<String, String> emailRequest) {
        try {
            String emailAddress = emailRequest.get("email");
            boolean sent = invoiceService.sendInvoiceByEmail(id, emailAddress);
            
            Map<String, String> response = Map.of(
                "status", sent ? "success" : "failed",
                "message", sent ? "Invoice sent successfully" : "Failed to send invoice"
            );
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> response = Map.of(
                "status", "error",
                "message", "Error sending invoice: " + e.getMessage()
            );
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }
    
    /**
     * Get invoices by date range
     */
    @GetMapping("/date-range")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Invoice>> getInvoicesByDateRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate) {
        
        List<Invoice> invoices = invoiceService.getInvoicesByDateRange(startDate, endDate);
        return ResponseEntity.ok(invoices);
    }
    
    /**
     * Get statistics
     */
    @GetMapping("/statistics")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> getInvoiceStatistics() {
        try {
            Map<String, Object> stats = Map.of(
                "totalPending", invoiceService.countInvoicesByStatus(Invoice.InvoiceStatus.PENDING),
                "totalSent", invoiceService.countInvoicesByStatus(Invoice.InvoiceStatus.SENT),
                "totalPaid", invoiceService.countInvoicesByStatus(Invoice.InvoiceStatus.PAID),
                "totalOverdue", invoiceService.countInvoicesByStatus(Invoice.InvoiceStatus.OVERDUE),
                "totalCancelled", invoiceService.countInvoicesByStatus(Invoice.InvoiceStatus.CANCELLED),
                "monthlyRevenue", invoiceService.getMonthlyRevenue(LocalDateTime.now().getYear(), LocalDateTime.now().getMonthValue()),
                "yearlyRevenue", invoiceService.getYearlyRevenue(LocalDateTime.now().getYear())
            );
            
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    /**
     * Update overdue invoices status
     */
    @PostMapping("/update-overdue")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, String>> updateOverdueInvoicesStatus() {
        try {
            invoiceService.updateOverdueInvoicesStatus();
            Map<String, String> response = Map.of(
                "status", "success",
                "message", "Overdue invoices updated successfully"
            );
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> response = Map.of(
                "status", "error",
                "message", "Error updating overdue invoices: " + e.getMessage()
            );
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }
    
    
    /**
     * Protected endpoint to get all invoices (ADMIN only)
     */
    @GetMapping("/public/all")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> getPublicInvoices(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {
        
        try {
            Sort sort = sortDir.equalsIgnoreCase("desc") ? 
                Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();
            Pageable pageable = PageRequest.of(page, size, sort);
            
            Page<Invoice> invoices = invoiceService.getAllInvoices(pageable);
            
            // Convert to safe format (avoid circular references)
            List<Map<String, Object>> safeInvoices = new ArrayList<>();
            for (Invoice invoice : invoices.getContent()) {
                Map<String, Object> safeInvoice = new HashMap<>();
                safeInvoice.put("id", invoice.getId());
                safeInvoice.put("invoiceNumber", invoice.getInvoiceNumber());
                safeInvoice.put("issueDate", invoice.getIssueDate());
                safeInvoice.put("dueDate", invoice.getDueDate());
                safeInvoice.put("totalAmount", invoice.getTotalAmount());
                safeInvoice.put("status", invoice.getStatus());
                safeInvoice.put("clientName", invoice.getClientName());
                safeInvoice.put("clientEmail", invoice.getClientEmail());
                safeInvoice.put("reservationId", invoice.getReservationId());
                safeInvoices.add(safeInvoice);
            }
            
            Map<String, Object> response = new HashMap<>();
            response.put("content", safeInvoices);
            response.put("totalElements", invoices.getTotalElements());
            response.put("totalPages", invoices.getTotalPages());
            response.put("size", invoices.getSize());
            response.put("number", invoices.getNumber());
            response.put("first", invoices.isFirst());
            response.put("last", invoices.isLast());
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", e.getMessage());
            errorResponse.put("status", "ERROR");
            errorResponse.put("content", new ArrayList<>());
            errorResponse.put("totalElements", 0);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }
    
    /**
     * Test PDF generation for a specific invoice (ADMIN only)
     */
    @GetMapping("/{id}/test-pdf")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> testPDFGeneration(@PathVariable Long id) {
        try {
            Optional<Invoice> invoiceOpt = invoiceService.getInvoiceById(id);
            if (invoiceOpt.isEmpty()) {
                return ResponseEntity.notFound().build();
            }
            
            Invoice invoice = invoiceOpt.get();
            byte[] pdfBytes = invoicePDFService.generateInvoicePDFBytes(invoice);
            
            if (pdfBytes.length == 0) {
                return ResponseEntity.ok(Map.of(
                    "success", false,
                    "message", "PDF generation failed - empty byte array returned",
                    "invoiceNumber", invoice.getInvoiceNumber()
                ));
            }
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_PDF);
            headers.setContentDispositionFormData("attachment", "Facture_" + invoice.getInvoiceNumber() + ".pdf");
            
            return ResponseEntity.ok()
                .headers(headers)
                .body(pdfBytes);
                
        } catch (Exception e) {
            return ResponseEntity.ok(Map.of(
                "success", false,
                "error", e.getMessage(),
                "message", "Error during PDF generation test"
            ));
        }
    }
    
    /**
     * Test email sending with PDF attachment for a specific invoice (ADMIN only)
     */
    @PostMapping("/{id}/test-email")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> testEmailSending(@PathVariable Long id) {
        try {
            Optional<Invoice> invoiceOpt = invoiceService.getInvoiceById(id);
            if (invoiceOpt.isEmpty()) {
                return ResponseEntity.ok(Map.of(
                    "success", false,
                    "message", "Invoice not found"
                ));
            }
            
            Invoice invoice = invoiceOpt.get();
            
            // Check if invoice has client information
            if (invoice.getReservation() == null || invoice.getReservation().getClient() == null) {
                return ResponseEntity.ok(Map.of(
                    "success", false,
                    "message", "Invoice is not associated with a client",
                    "invoiceNumber", invoice.getInvoiceNumber()
                ));
            }
            
            // Generate PDF
            byte[] pdfBytes = invoicePDFService.generateInvoicePDFBytes(invoice);
            
            if (pdfBytes.length == 0) {
                return ResponseEntity.ok(Map.of(
                    "success", false,
                    "message", "PDF generation failed - cannot send email without PDF",
                    "invoiceNumber", invoice.getInvoiceNumber()
                ));
            }
            
            // Send email with PDF attachment
            boolean emailSent = emailService.sendInvoiceEmail(invoice, pdfBytes);
            
            return ResponseEntity.ok(Map.of(
                "success", emailSent,
                "message", emailSent ? "Email sent successfully with PDF attachment" : "Failed to send email",
                "invoiceNumber", invoice.getInvoiceNumber(),
                "clientEmail", invoice.getReservation().getClient().getEmail(),
                "pdfSize", pdfBytes.length + " bytes"
            ));
            
        } catch (Exception e) {
            return ResponseEntity.ok(Map.of(
                "success", false,
                "error", e.getMessage(),
                "message", "Error during email sending test"
            ));
        }
    }

    /**
     * Add payment to invoice (Used by frontend PaymentDialogComponent)
     */
    @PostMapping("/{invoiceId}/payments")
    @PreAuthorize("hasRole('ADMIN') or hasRole('CLIENT')")
    public ResponseEntity<?> addPaymentToInvoice(
            @PathVariable Long invoiceId,
            @RequestBody Map<String, Object> request,
            @RequestHeader(value = "Idempotency-Key", required = false) String headerIdempotencyKey,
            org.springframework.security.core.Authentication authentication) {
        try {
            Optional<Invoice> invoiceOpt = invoiceService.getInvoiceById(invoiceId);
            if (invoiceOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "Facture introuvable"));
            }
            Invoice invoice = invoiceOpt.get();
            boolean isAdmin = authentication.getAuthorities().stream().anyMatch(a -> a.getAuthority().contains("ADMIN"));
            if (!isAdmin) {
                String email = authentication.getName();
                if (invoice.getReservation() == null || invoice.getReservation().getClient() == null ||
                    !email.equalsIgnoreCase(invoice.getReservation().getClient().getEmail())) {
                    return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", "Accès refusé"));
                }
            }

            Double amount = Double.valueOf(request.get("amount").toString());
            String methodStr = request.getOrDefault("paymentMethod", "CASH").toString().toUpperCase();
            Payment.PaymentMethod method = Payment.PaymentMethod.valueOf(methodStr);
            String transactionId = request.containsKey("transactionId") && request.get("transactionId") != null ? 
                    request.get("transactionId").toString() : null;
            String notes = request.containsKey("notes") && request.get("notes") != null ? 
                    request.get("notes").toString() : null;
            String idempotencyKey = request.containsKey("idempotencyKey") && request.get("idempotencyKey") != null ? 
                    request.get("idempotencyKey").toString() : headerIdempotencyKey;

            Payment payment = paymentProcessingService.addPaymentToInvoice(
                    invoiceId, amount, method, transactionId, notes, idempotencyKey);
            return ResponseEntity.status(HttpStatus.CREATED).body(payment);

        } catch (IllegalArgumentException | IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", e.getMessage()));
        }
    }
}
