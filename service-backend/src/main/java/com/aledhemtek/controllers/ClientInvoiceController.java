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

    /**
     * Get current client's invoices (simplified version)
     */
    @GetMapping("/invoices")
    @PreAuthorize("hasRole('CLIENT')")
    public ResponseEntity<?> getMyInvoices(Authentication authentication) {
        try {
            // For now, return all invoices - in a real implementation,
            // you would filter by the current user's client ID
            // Using a simple pageable to get all invoices
            org.springframework.data.domain.Pageable pageable = org.springframework.data.domain.PageRequest.of(0, 1000);
            List<Invoice> invoices = invoiceService.getAllInvoices(pageable).getContent();
            
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
            // Using a simple pageable to get all invoices
            org.springframework.data.domain.Pageable pageable = org.springframework.data.domain.PageRequest.of(0, 1000);
            List<Invoice> invoices = invoiceService.getAllInvoices(pageable).getContent();
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
    public ResponseEntity<?> getMyInvoiceById(@PathVariable Long invoiceId) {
        try {
            Optional<Invoice> invoiceOpt = invoiceService.getInvoiceWithDetailsById(invoiceId);
            
            if (invoiceOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("error", "Invoice not found"));
            }
            
            Invoice invoice = invoiceOpt.get();
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
    public ResponseEntity<?> processPayment(@RequestBody Map<String, Object> paymentRequest) {
        try {
            Long invoiceId = Long.valueOf(paymentRequest.get("invoiceId").toString());
            Double amount = Double.valueOf(paymentRequest.get("amount").toString());
            String paymentMethod = paymentRequest.get("paymentMethod").toString();
            String status = paymentRequest.getOrDefault("status", "PENDING").toString();
            String notes = paymentRequest.getOrDefault("notes", "").toString();
            
            // Vérifier que la facture appartient au client connecté
            Optional<Invoice> invoiceOpt = invoiceService.getInvoiceById(invoiceId);
            if (invoiceOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("success", false, "message", "Facture non trouvée"));
            }
            
            Invoice invoice = invoiceOpt.get();
            // Vérifier l'authentification via Spring Security
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            String currentUserEmail = auth.getName();
            
            // Vérifier que l'email correspond au client de la facture
            if (!currentUserEmail.equals(invoice.getReservation().getClient().getEmail())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(Map.of("success", false, "message", "Accès non autorisé"));
            }
            
            // Créer le paiement
            Payment payment = new Payment();
            payment.setInvoice(invoice);
            payment.setAmount(amount);
            
            // Convertir la méthode de paiement
            Payment.PaymentMethod method;
            switch (paymentMethod.toLowerCase()) {
                case "cash":
                    method = Payment.PaymentMethod.CASH;
                    break;
                case "check":
                    method = Payment.PaymentMethod.CHECK;
                    break;
                case "stripe":
                    method = Payment.PaymentMethod.STRIPE;
                    break;
                case "paypal":
                    method = Payment.PaymentMethod.PAYPAL;
                    break;
                case "bank_transfer":
                    method = Payment.PaymentMethod.BANK_TRANSFER;
                    break;
                default:
                    method = Payment.PaymentMethod.OTHER;
            }
            payment.setPaymentMethod(method);
            
            payment.setPaymentDate(LocalDateTime.now());
            
            // Convertir le statut
            Payment.PaymentStatus paymentStatus;
            if ("PENDING_VALIDATION".equals(status)) {
                paymentStatus = Payment.PaymentStatus.PENDING;
            } else {
                paymentStatus = Payment.PaymentStatus.PENDING;
            }
            payment.setStatus(paymentStatus);
            payment.setNotes(notes);
            
            // Générer la référence de paiement
            payment.generatePaymentReference();
            
            // Sauvegarder le paiement en base de données
            Payment savedPayment = paymentRepository.save(payment);
            
            // Log pour le suivi
            System.out.println("Paiement créé avec succès: " + savedPayment.getPaymentReference() + 
                             " pour la facture: " + invoice.getInvoiceNumber());
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Paiement traité avec succès");
            response.put("paymentId", savedPayment.getId());
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("success", false, "message", "Erreur lors du traitement du paiement"));
        }
    }
}
