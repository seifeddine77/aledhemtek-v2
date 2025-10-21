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
@CrossOrigin(origins = "*")
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
    
    /**
     * Create a new invoice
     */
    @PostMapping
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
    public ResponseEntity<Invoice> getInvoiceByNumber(@PathVariable String invoiceNumber) {
        Optional<Invoice> invoice = invoiceService.getInvoiceByNumber(invoiceNumber);
        return invoice.map(ResponseEntity::ok)
                     .orElse(ResponseEntity.notFound().build());
    }
    
    /**
     * Update invoice
     */
    @PutMapping("/{id}")
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
    public ResponseEntity<List<Invoice>> getInvoicesByStatus(@PathVariable Invoice.InvoiceStatus status) {
        List<Invoice> invoices = invoiceService.getInvoicesByStatus(status);
        return ResponseEntity.ok(invoices);
    }
    
    /**
     * Get invoices by client ID
     */
    @GetMapping("/client/{clientId}")
    public ResponseEntity<List<Invoice>> getInvoicesByClientId(@PathVariable Long clientId) {
        List<Invoice> invoices = invoiceService.getInvoicesByClientId(clientId);
        return ResponseEntity.ok(invoices);
    }
    
    /**
     * Search invoices
     */
    @GetMapping("/search")
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
    public ResponseEntity<List<Invoice>> getOverdueInvoices() {
        List<Invoice> invoices = invoiceService.getOverdueInvoices();
        return ResponseEntity.ok(invoices);
    }
    
    /**
     * Get unpaid invoices
     */
    @GetMapping("/unpaid")
    public ResponseEntity<List<Invoice>> getUnpaidInvoices() {
        List<Invoice> invoices = invoiceService.getUnpaidInvoices();
        return ResponseEntity.ok(invoices);
    }
    
    /**
     * Get recent invoices
     */
    @GetMapping("/recent")
    public ResponseEntity<List<Invoice>> getRecentInvoices() {
        List<Invoice> invoices = invoiceService.getRecentInvoices();
        return ResponseEntity.ok(invoices);
    }
    
    /**
     * Add item to invoice
     */
    @PostMapping("/{id}/items")
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
    public ResponseEntity<Invoice> addPaymentToInvoice(@PathVariable Long id, @RequestBody Payment payment) {
        try {
            Invoice updatedInvoice = invoiceService.addPaymentToInvoice(id, payment);
            return ResponseEntity.ok(updatedInvoice);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }
    
    /**
     * Mark invoice as sent
     */
    @PutMapping("/{id}/mark-sent")
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
     * PUBLIC DEBUG: Test endpoint to diagnose invoice loading issues (no auth required)
     */
    @GetMapping("/public/debug/test-loading")
    public ResponseEntity<Map<String, Object>> publicDebugInvoiceLoading() {
        Map<String, Object> debugInfo = new HashMap<>();
        
        try {
            // Test 1: Test pagination endpoint directly
            Pageable testPageable = PageRequest.of(0, 3);
            Page<Invoice> paginatedResult = invoiceService.getAllInvoices(testPageable);
            debugInfo.put("paginationTest", Map.of(
                "totalElements", paginatedResult.getTotalElements(),
                "totalPages", paginatedResult.getTotalPages(),
                "currentPageSize", paginatedResult.getContent().size(),
                "hasContent", paginatedResult.hasContent()
            ));
            
            // Test 2: Get basic invoice data (without circular references)
            List<Map<String, Object>> invoiceDetails = new ArrayList<>();
            for (Invoice invoice : paginatedResult.getContent()) {
                Map<String, Object> invoiceData = new HashMap<>();
                invoiceData.put("id", invoice.getId());
                invoiceData.put("invoiceNumber", invoice.getInvoiceNumber());
                invoiceData.put("status", invoice.getStatus().toString());
                invoiceData.put("totalAmount", invoice.getTotalAmount());
                invoiceData.put("clientName", invoice.getClientName());
                invoiceData.put("clientEmail", invoice.getClientEmail());
                invoiceData.put("reservationId", invoice.getReservationId());
                invoiceDetails.add(invoiceData);
            }
            debugInfo.put("invoiceDetails", invoiceDetails);
            
            debugInfo.put("status", "SUCCESS");
            debugInfo.put("timestamp", LocalDateTime.now().toString());
            
            return ResponseEntity.ok(debugInfo);
            
        } catch (Exception e) {
            debugInfo.put("status", "ERROR");
            debugInfo.put("error", e.getMessage());
            debugInfo.put("errorClass", e.getClass().getSimpleName());
            debugInfo.put("stackTrace", e.getStackTrace()[0].toString());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(debugInfo);
        }
    }
    
    /**
     * TEMPORARY: Public endpoint to get all invoices (for debugging auth issues)
     */
    @GetMapping("/public/all")
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
     * Create a test invoice for debugging purposes
     */
    @GetMapping("/public/create-test")
    public ResponseEntity<Map<String, Object>> createTestInvoice() {
        try {
            // Create a simple test invoice with manual invoice number
            Invoice testInvoice = new Invoice();
            testInvoice.setInvoiceNumber("INV-TEST-" + System.currentTimeMillis());
            testInvoice.setTotalAmount(225.0);
            testInvoice.setAmountExclTax(187.5);
            testInvoice.setTaxAmount(37.5);
            testInvoice.setTaxRate(20.0);
            testInvoice.setStatus(Invoice.InvoiceStatus.PENDING);
            testInvoice.setNotes("Facture de test créée automatiquement - Test simple");
            testInvoice.setIssueDate(LocalDateTime.now());
            testInvoice.setDueDate(LocalDateTime.now().plusDays(30));
            testInvoice.setEmailSent(false);
            testInvoice.setReminderCount(0);
            testInvoice.setAutoGenerated(false);
            
            // Save directly via repository to bypass service logic temporarily
            Invoice savedInvoice = invoiceRepository.save(testInvoice);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Facture de test créée avec succès (méthode directe)");
            response.put("invoiceId", savedInvoice.getId());
            response.put("invoiceNumber", savedInvoice.getInvoiceNumber());
            response.put("totalAmount", savedInvoice.getTotalAmount());
            response.put("status", savedInvoice.getStatus());
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("error", e.getMessage());
            errorResponse.put("message", "Erreur lors de la création de la facture de test");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }
    
    /**
     * Create a simple test invoice using the corrected service
     */
    @GetMapping("/public/create-test-simple")
    public ResponseEntity<?> createSimpleTestInvoice() {
        try {
            Invoice invoice = new Invoice();
            invoice.setTotalAmount(150.0);
            invoice.setAmountExclTax(125.0);
            invoice.setTaxAmount(25.0);
            invoice.setTaxRate(20.0);
            invoice.setStatus(Invoice.InvoiceStatus.PENDING);
            invoice.setNotes("Test simple avec service corrigé");
            
            Invoice saved = invoiceService.createInvoice(invoice);
            
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Facture créée avec succès !",
                "invoiceNumber", saved.getInvoiceNumber(),
                "id", saved.getId(),
                "totalAmount", saved.getTotalAmount(),
                "status", saved.getStatus()
            ));
        } catch (Exception e) {
            return ResponseEntity.ok(Map.of(
                "success", false,
                "error", e.getMessage(),
                "message", "Erreur lors de la création"
            ));
        }
    }
    
    /**
     * Create a test invoice via service for debugging purposes
     */
    @GetMapping("/public/create-test-service")
    public ResponseEntity<Map<String, Object>> createTestInvoiceViaService() {
        try {
            // Create a test invoice (without reservation for testing)
            Invoice testInvoice = new Invoice();
            testInvoice.setStatus(Invoice.InvoiceStatus.PENDING);
            testInvoice.setNotes("Facture de test créée automatiquement - Sans réservation");
            
            // Add test invoice items
            InvoiceItem item1 = new InvoiceItem();
            item1.setDesignation("Service de test 1");
            item1.setDescription("Description du service de test 1");
            item1.setQuantity(2);
            item1.setUnitPrice(50.0);
            item1.setTaxRate(20.0);
            item1.setInvoice(testInvoice);
            
            InvoiceItem item2 = new InvoiceItem();
            item2.setDesignation("Service de test 2");
            item2.setDescription("Description du service de test 2");
            item2.setQuantity(1);
            item2.setUnitPrice(75.0);
            item2.setTaxRate(20.0);
            item2.setInvoice(testInvoice);
            
            testInvoice.getInvoiceItems().add(item1);
            testInvoice.getInvoiceItems().add(item2);
            
            // Save the invoice
            Invoice savedInvoice = invoiceService.createInvoice(testInvoice);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Facture de test créée avec succès");
            response.put("invoiceId", savedInvoice.getId());
            response.put("invoiceNumber", savedInvoice.getInvoiceNumber());
            response.put("totalAmount", savedInvoice.getTotalAmount());
            response.put("status", savedInvoice.getStatus());
            response.put("clientName", savedInvoice.getClientName());
            response.put("clientEmail", savedInvoice.getClientEmail());
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("error", e.getMessage());
            errorResponse.put("message", "Erreur lors de la création de la facture de test");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }
    
    /**
     * TEMPORARY: Create a test invoice for debugging (POST version)
     */
    @PostMapping("/public/create-test")
    public ResponseEntity<Map<String, Object>> createTestInvoicePost() {
        return createTestInvoice();
    }
    
    /**
     * TEMPORARY: Test automatic invoice generation for a reservation
     */
    @GetMapping("/public/test-auto-generation/{reservationId}")
    public ResponseEntity<Map<String, Object>> testAutoInvoiceGeneration(@PathVariable Long reservationId) {
        try {
            // Test the automatic invoice generation service
            autoInvoiceService.generateInvoiceForCompletedReservation(reservationId);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Génération automatique de facture testée pour la réservation " + reservationId);
            response.put("reservationId", reservationId);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("error", e.getMessage());
            errorResponse.put("message", "Erreur lors de la génération automatique de facture");
            errorResponse.put("reservationId", reservationId);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }
    
    /**
     * Test PDF generation for a specific invoice
     */
    @GetMapping("/{id}/test-pdf")
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
     * Test email sending with PDF attachment for a specific invoice
     */
    @PostMapping("/{id}/test-email")
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

}
