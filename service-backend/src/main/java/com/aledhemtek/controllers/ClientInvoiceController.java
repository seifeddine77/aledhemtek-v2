package com.aledhemtek.controllers;

import com.aledhemtek.interfaces.InvoiceService;
import com.aledhemtek.model.Invoice;
import com.aledhemtek.model.Invoice.InvoiceStatus;
import com.aledhemtek.model.Payment;
import com.aledhemtek.services.InvoicePDFService;

import com.aledhemtek.repositories.PaymentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import org.springframework.web.bind.annotation.*;


import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/api/client")
@CrossOrigin(origins = "http://localhost:4200")
public class ClientInvoiceController {

    @Autowired
    private InvoiceService invoiceService;
    
    @Autowired
    private InvoicePDFService invoicePDFService;
    
    @Autowired
    private PaymentRepository paymentRepository;

    @Autowired
    private com.aledhemtek.services.PaymentProcessingService paymentProcessingService;

    /**
     * Get current client's invoices (simplified version)
     */
    @GetMapping("/invoices")
    @PreAuthorize("hasRole('CLIENT')")
    public ResponseEntity<?> getMyInvoices(Authentication authentication) {
        try {
            Long clientId = null;
            if (authentication != null && authentication.getPrincipal() instanceof com.aledhemtek.config.CustomUserDetails) {
                clientId = ((com.aledhemtek.config.CustomUserDetails) authentication.getPrincipal()).getUser().getId();
            }
            if (clientId == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Unauthorized"));
            }
            List<Invoice> invoices = invoiceService.getInvoicesByClientId(clientId);
            
            List<Map<String, Object>> invoiceList = invoices.stream()
                .map(this::transformInvoiceForClient)
                .toList();
            
            return ResponseEntity.ok(invoiceList);
            
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to fetch client invoices"));
        }
    }

    /**
     * Get client invoice statistics
     */
    @GetMapping("/invoices/stats")
    @PreAuthorize("hasRole('CLIENT')")
    public ResponseEntity<?> getMyInvoiceStats(Authentication authentication) {
        try {
            Long clientId = null;
            if (authentication != null && authentication.getPrincipal() instanceof com.aledhemtek.config.CustomUserDetails) {
                clientId = ((com.aledhemtek.config.CustomUserDetails) authentication.getPrincipal()).getUser().getId();
            }
            if (clientId == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Unauthorized"));
            }
            List<Invoice> invoices = invoiceService.getInvoicesByClientId(clientId);
            Map<String, Object> stats = calculateInvoiceStats(invoices);
            return ResponseEntity.ok(stats);
            
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to fetch invoice statistics"));
        }
    }

    /**
     * Get specific invoice details
     */
    @GetMapping("/invoices/{invoiceId}")
    @PreAuthorize("hasRole('CLIENT')")
    public ResponseEntity<?> getMyInvoiceById(@PathVariable Long invoiceId, Authentication authentication) {
        try {
            Optional<Invoice> invoiceOpt = invoiceService.getInvoiceWithDetailsById(invoiceId);
            
            if (invoiceOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("error", "Invoice not found"));
            }
            
            Invoice invoice = invoiceOpt.get();
            String clientEmail = authentication != null ? authentication.getName() : null;
            if (invoice.getReservation() == null || invoice.getReservation().getClient() == null ||
                clientEmail == null || !clientEmail.equalsIgnoreCase(invoice.getReservation().getClient().getEmail())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(Map.of("error", "Access denied - You are not authorized to view this invoice"));
            }

            Map<String, Object> invoiceData = transformInvoiceDetailForClient(invoice);
            return ResponseEntity.ok(invoiceData);
            
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to fetch invoice details"));
        }
    }

    /**
     * Download invoice PDF
     */
    @GetMapping("/invoices/{invoiceId}/pdf")
    @PreAuthorize("hasRole('CLIENT')")
    public ResponseEntity<?> downloadMyInvoicePDF(@PathVariable Long invoiceId, Authentication authentication) {
        try {
            Optional<Invoice> invoiceOpt = invoiceService.getInvoiceById(invoiceId);
            
            if (invoiceOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("error", "Invoice not found"));
            }
            
            Invoice invoice = invoiceOpt.get();
            
            // Verify that the invoice belongs to the current client
            if (invoice.getReservation() == null || invoice.getReservation().getClient() == null) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(Map.of("error", "Access denied - Invoice not associated with a client"));
            }
            
            String clientEmail = authentication.getName();
            if (!invoice.getReservation().getClient().getEmail().equals(clientEmail)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(Map.of("error", "Access denied - This invoice does not belong to you"));
            }
        
        // Generate actual PDF
        byte[] pdfBytes = invoicePDFService.generateInvoicePDFBytes(invoice);
        
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_PDF);
        headers.setContentDispositionFormData("attachment", "facture_" + invoice.getInvoiceNumber() + ".pdf");
        
        return ResponseEntity.ok()
                .headers(headers)
                .body(pdfBytes);
            
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to download invoice PDF"));
        }
    }

    // Helper Methods
    private Map<String, Object> transformInvoiceForClient(Invoice invoice) {
        Map<String, Object> invoiceMap = new HashMap<>();
        invoiceMap.put("id", invoice.getId());
        invoiceMap.put("invoiceNumber", invoice.getInvoiceNumber());
        invoiceMap.put("issueDate", invoice.getIssueDate());
        invoiceMap.put("dueDate", invoice.getDueDate());
        invoiceMap.put("totalAmount", invoice.getTotalAmount());
        invoiceMap.put("paidAmount", calculatePaidAmount(invoice));
        invoiceMap.put("remainingAmount", invoice.getTotalAmount() - calculatePaidAmount(invoice));
        invoiceMap.put("status", invoice.getStatus());
        invoiceMap.put("pdfPath", invoice.getPdfPath());
        invoiceMap.put("notes", invoice.getNotes());
        invoiceMap.put("createdAt", invoice.getCreatedAt());
        invoiceMap.put("updatedAt", invoice.getUpdatedAt());
        
        // Add client information
        if (invoice.getReservation() != null && invoice.getReservation().getClient() != null) {
            invoiceMap.put("clientId", invoice.getReservation().getClient().getId());
            invoiceMap.put("clientName", invoice.getReservation().getClient().getFirstName() + " " + 
                                         invoice.getReservation().getClient().getLastName());
            invoiceMap.put("clientEmail", invoice.getReservation().getClient().getEmail());
        } else {
            invoiceMap.put("clientId", 0);
            invoiceMap.put("clientName", "Client non défini");
            invoiceMap.put("clientEmail", "");
        }
        
        // Add reservation info if available
        if (invoice.getReservation() != null) {
            Map<String, Object> reservationMap = new HashMap<>();
            reservationMap.put("id", invoice.getReservation().getId());
            reservationMap.put("title", invoice.getReservation().getTitle());
            reservationMap.put("startDate", invoice.getReservation().getStartDate());
            reservationMap.put("endDate", invoice.getReservation().getEndDate());
            invoiceMap.put("reservation", reservationMap);
        }
        
        // Add items
        if (invoice.getInvoiceItems() != null) {
            List<Map<String, Object>> items = invoice.getInvoiceItems().stream()
                .map(item -> {
                    Map<String, Object> itemMap = new HashMap<>();
                    itemMap.put("id", item.getId());
                    itemMap.put("description", item.getDescription());
                    itemMap.put("quantity", item.getQuantity());
                    itemMap.put("unitPrice", item.getUnitPrice());
                    itemMap.put("totalPrice", item.getTotal());
                    return itemMap;
                })
                .toList();
            invoiceMap.put("items", items);
        } else {
            invoiceMap.put("items", List.of());
        }
        
        // Add payments
        if (invoice.getPayments() != null) {
            List<Map<String, Object>> payments = invoice.getPayments().stream()
                .map(payment -> {
                    Map<String, Object> paymentMap = new HashMap<>();
                    paymentMap.put("id", payment.getId());
                    paymentMap.put("amount", payment.getAmount());
                    paymentMap.put("paymentDate", payment.getPaymentDate());
                    paymentMap.put("paymentMethod", payment.getPaymentMethod());
                    paymentMap.put("transactionId", payment.getTransactionId());
                    paymentMap.put("notes", payment.getNotes());
                    return paymentMap;
                })
                .toList();
            invoiceMap.put("payments", payments);
        } else {
            invoiceMap.put("payments", List.of());
        }
        
        return invoiceMap;
    }

    private Map<String, Object> transformInvoiceDetailForClient(Invoice invoice) {
        Map<String, Object> invoiceMap = transformInvoiceForClient(invoice);
        
        // Add items
        if (invoice.getInvoiceItems() != null) {
            List<Map<String, Object>> items = invoice.getInvoiceItems().stream()
                .map(item -> {
                    Map<String, Object> itemMap = new HashMap<>();
                    itemMap.put("id", item.getId());
                    itemMap.put("description", item.getDescription());
                    itemMap.put("quantity", item.getQuantity());
                    itemMap.put("unitPrice", item.getUnitPrice());
                    itemMap.put("totalPrice", item.getTotal());
                    return itemMap;
                })
                .toList();
            invoiceMap.put("items", items);
        }
        
        // Add payments
        if (invoice.getPayments() != null) {
            List<Map<String, Object>> payments = invoice.getPayments().stream()
                .map(payment -> {
                    Map<String, Object> paymentMap = new HashMap<>();
                    paymentMap.put("id", payment.getId());
                    paymentMap.put("amount", payment.getAmount());
                    paymentMap.put("paymentDate", payment.getPaymentDate());
                    paymentMap.put("paymentMethod", payment.getPaymentMethod());
                    paymentMap.put("transactionId", payment.getTransactionId());
                    paymentMap.put("notes", payment.getNotes());
                    return paymentMap;
                })
                .toList();
            invoiceMap.put("payments", payments);
        }
        
        return invoiceMap;
    }

    private double calculatePaidAmount(Invoice invoice) {
        if (invoice.getPayments() == null) {
            return 0.0;
        }
        return invoice.getPayments().stream()
                .mapToDouble(payment -> payment.getAmount())
                .sum();
    }

    private Map<String, Object> calculateInvoiceStats(List<Invoice> invoices) {
        Map<String, Object> stats = new HashMap<>();
        
        int totalInvoices = invoices.size();
        double totalAmount = invoices.stream()
                .mapToDouble(Invoice::getTotalAmount)
                .sum();
        double paidAmount = invoices.stream()
                .mapToDouble(this::calculatePaidAmount)
                .sum();
        double pendingAmount = totalAmount - paidAmount;
        double overdueAmount = invoices.stream()
                .filter(inv -> inv.getStatus() == InvoiceStatus.OVERDUE)
                .mapToDouble(Invoice::getTotalAmount)
                .sum();
        
        // Status counts
        Map<String, Long> statusCounts = new HashMap<>();
        for (InvoiceStatus status : InvoiceStatus.values()) {
            long count = invoices.stream()
                    .filter(inv -> inv.getStatus() == status)
                    .count();
            statusCounts.put(status.name(), count);
        }
        
        stats.put("totalInvoices", totalInvoices);
        stats.put("totalAmount", totalAmount);
        stats.put("paidAmount", paidAmount);
        stats.put("pendingAmount", pendingAmount);
        stats.put("overdueAmount", overdueAmount);
        stats.put("statusCounts", statusCounts);
        
        return stats;
    }

    @PostMapping("/payments/process")
    @PreAuthorize("hasRole('CLIENT')")
    public ResponseEntity<?> processPayment(
            @RequestBody Map<String, Object> paymentRequest,
            @RequestHeader(value = "Idempotency-Key", required = false) String headerIdempotencyKey) {
        try {
            Long invoiceId = Long.valueOf(paymentRequest.get("invoiceId").toString());
            Double amount = Double.valueOf(paymentRequest.get("amount").toString());
            String paymentMethodStr = paymentRequest.getOrDefault("paymentMethod", "STRIPE").toString().toUpperCase();
            String notes = paymentRequest.getOrDefault("notes", "").toString();
            String idempotencyKey = paymentRequest.containsKey("idempotencyKey") ?
                    paymentRequest.get("idempotencyKey").toString() : headerIdempotencyKey;
            
            // 1. Vérifier existence de la facture
            Optional<Invoice> invoiceOpt = invoiceService.getInvoiceById(invoiceId);
            if (invoiceOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("success", false, "message", "Facture non trouvée"));
            }
            
            Invoice invoice = invoiceOpt.get();

            // 2. Vérifier que la facture appartient bien au client connecté (Anti-IDOR)
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            String currentUserEmail = auth != null ? auth.getName() : null;
            if (invoice.getReservation() == null || invoice.getReservation().getClient() == null ||
                currentUserEmail == null || !currentUserEmail.equalsIgnoreCase(invoice.getReservation().getClient().getEmail())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(Map.of("success", false, "message", "Accès non autorisé à cette facture"));
            }
            
            // 3. Déléguer au service sécurisé selon la méthode de paiement
            Payment payment;
            switch (paymentMethodStr) {
                case "STRIPE":
                case "CREDIT_CARD":
                    String token = paymentRequest.containsKey("stripeToken") ? 
                            paymentRequest.get("stripeToken").toString() : "tok_visa";
                    payment = paymentProcessingService.processCreditCardPayment(invoice, amount, token, idempotencyKey);
                    break;
                case "PAYPAL":
                    String paypalId = paymentRequest.containsKey("paypalPaymentId") ? 
                            paymentRequest.get("paypalPaymentId").toString() : "PAYID-" + UUID.randomUUID().toString().substring(0, 8);
                    payment = paymentProcessingService.processPayPalPayment(invoice, amount, paypalId, idempotencyKey);
                    break;
                case "BANK_TRANSFER":
                    String ref = paymentRequest.containsKey("transferReference") ? 
                            paymentRequest.get("transferReference").toString() : "VIR-" + System.currentTimeMillis();
                    payment = paymentProcessingService.processBankTransferPayment(invoice, amount, ref, idempotencyKey);
                    break;
                case "CASH":
                    payment = paymentProcessingService.processCashPayment(invoice, amount, notes, idempotencyKey);
                    break;
                default:
                    payment = paymentProcessingService.addPaymentToInvoice(
                        invoiceId, amount, Payment.PaymentMethod.OTHER, "manual_" + System.currentTimeMillis(), notes, idempotencyKey);
            }
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", payment.getStatus() == Payment.PaymentStatus.VALIDATED || payment.getStatus() == Payment.PaymentStatus.PENDING);
            response.put("message", payment.getStatus() == Payment.PaymentStatus.VALIDATED ? 
                    "Paiement validé avec succès !" : "Paiement enregistré en attente de validation");
            response.put("paymentId", payment.getId());
            response.put("paymentReference", payment.getPaymentReference());
            response.put("transactionId", payment.getTransactionId());
            response.put("status", payment.getStatus().toString());
            response.put("invoiceStatus", invoice.getStatus().toString());
            response.put("remainingAmount", invoice.getRemainingAmount());
            
            return ResponseEntity.ok(response);
            
        } catch (IllegalArgumentException | IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("success", false, "message", e.getMessage()));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("success", false, "message", "Erreur lors du traitement du paiement: " + e.getMessage()));
        }
    }
}
