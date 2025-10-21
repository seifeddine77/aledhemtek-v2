package com.aledhemtek.controllers;

import com.aledhemtek.model.Invoice;
import com.aledhemtek.model.Payment;
import com.aledhemtek.interfaces.InvoiceService;
import com.aledhemtek.services.PaymentProcessingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/payments")
@CrossOrigin(origins = "http://localhost:4200")
public class PaymentController {
    
    @Autowired
    private PaymentProcessingService paymentProcessingService;
    
    @Autowired
    private InvoiceService invoiceService;
    
    /**
     * Create payment intent for online payment
     */
    @PostMapping("/create-intent")
    public ResponseEntity<Map<String, Object>> createPaymentIntent(
            @RequestBody Map<String, Object> request) {
        try {
            Long invoiceId = Long.valueOf(request.get("invoiceId").toString());
            String paymentMethodStr = request.get("paymentMethod").toString();
            Payment.PaymentMethod paymentMethod = Payment.PaymentMethod.valueOf(paymentMethodStr);
            
            Optional<Invoice> invoiceOpt = invoiceService.getInvoiceById(invoiceId);
            if (invoiceOpt.isEmpty()) {
                return ResponseEntity.badRequest()
                    .body(Map.of("error", "Invoice not found"));
            }
            
            Map<String, Object> intent = paymentProcessingService.createPaymentIntent(
                invoiceOpt.get(), paymentMethod);
            
            return ResponseEntity.ok(intent);
            
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to create payment intent: " + e.getMessage()));
        }
    }
    
    /**
     * Process credit card payment
     */
    @PostMapping("/credit-card")
    public ResponseEntity<Map<String, Object>> processCreditCardPayment(
            @RequestBody Map<String, Object> request) {
        try {
            Long invoiceId = Long.valueOf(request.get("invoiceId").toString());
            Double amount = Double.valueOf(request.get("amount").toString());
            String stripeToken = request.get("stripeToken").toString();
            
            Optional<Invoice> invoiceOpt = invoiceService.getInvoiceById(invoiceId);
            if (invoiceOpt.isEmpty()) {
                return ResponseEntity.badRequest()
                    .body(Map.of("error", "Invoice not found"));
            }
            
            Payment payment = paymentProcessingService.processCreditCardPayment(
                invoiceOpt.get(), amount, stripeToken);
            
            return ResponseEntity.ok(Map.of(
                "status", "success",
                "payment", payment,
                "message", "Payment processed successfully"
            ));
            
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(Map.of("error", "Payment failed: " + e.getMessage()));
        }
    }
    
    /**
     * Process PayPal payment
     */
    @PostMapping("/paypal")
    public ResponseEntity<Map<String, Object>> processPayPalPayment(
            @RequestBody Map<String, Object> request) {
        try {
            Long invoiceId = Long.valueOf(request.get("invoiceId").toString());
            Double amount = Double.valueOf(request.get("amount").toString());
            String paypalPaymentId = request.get("paypalPaymentId").toString();
            
            Optional<Invoice> invoiceOpt = invoiceService.getInvoiceById(invoiceId);
            if (invoiceOpt.isEmpty()) {
                return ResponseEntity.badRequest()
                    .body(Map.of("error", "Invoice not found"));
            }
            
            Payment payment = paymentProcessingService.processPayPalPayment(
                invoiceOpt.get(), amount, paypalPaymentId);
            
            return ResponseEntity.ok(Map.of(
                "status", "success",
                "payment", payment,
                "message", "PayPal payment processed successfully"
            ));
            
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(Map.of("error", "PayPal payment failed: " + e.getMessage()));
        }
    }
    
    /**
     * Process bank transfer payment
     */
    @PostMapping("/bank-transfer")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> processBankTransferPayment(
            @RequestBody Map<String, Object> request) {
        try {
            Long invoiceId = Long.valueOf(request.get("invoiceId").toString());
            Double amount = Double.valueOf(request.get("amount").toString());
            String transferReference = request.get("transferReference").toString();
            
            Optional<Invoice> invoiceOpt = invoiceService.getInvoiceById(invoiceId);
            if (invoiceOpt.isEmpty()) {
                return ResponseEntity.badRequest()
                    .body(Map.of("error", "Invoice not found"));
            }
            
            Payment payment = paymentProcessingService.processBankTransferPayment(
                invoiceOpt.get(), amount, transferReference);
            
            return ResponseEntity.ok(Map.of(
                "status", "success",
                "payment", payment,
                "message", "Bank transfer payment recorded"
            ));
            
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(Map.of("error", "Bank transfer failed: " + e.getMessage()));
        }
    }
    
    /**
     * Process cash payment
     */
    @PostMapping("/cash")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> processCashPayment(
            @RequestBody Map<String, Object> request) {
        try {
            Long invoiceId = Long.valueOf(request.get("invoiceId").toString());
            Double amount = Double.valueOf(request.get("amount").toString());
            String notes = request.getOrDefault("notes", "").toString();
            
            Optional<Invoice> invoiceOpt = invoiceService.getInvoiceById(invoiceId);
            if (invoiceOpt.isEmpty()) {
                return ResponseEntity.badRequest()
                    .body(Map.of("error", "Invoice not found"));
            }
            
            Payment payment = paymentProcessingService.processCashPayment(
                invoiceOpt.get(), amount, notes);
            
            return ResponseEntity.ok(Map.of(
                "status", "success",
                "payment", payment,
                "message", "Cash payment processed successfully"
            ));
            
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(Map.of("error", "Cash payment failed: " + e.getMessage()));
        }
    }
    
    /**
     * Validate any payment (all payment methods supported)
     */
    @PostMapping("/{paymentId}/validate")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> validatePayment(
            @PathVariable Long paymentId,
            @RequestBody Map<String, Object> request) {
        try {
            boolean approved = Boolean.parseBoolean(request.get("approved").toString());
            String notes = request.getOrDefault("notes", "").toString();
            
            // Utiliser la nouvelle méthode unifiée de validation
            Payment payment = paymentProcessingService.validatePayment(paymentId, approved, notes);
            
            return ResponseEntity.ok(Map.of(
                "status", "success",
                "payment", payment,
                "message", approved ? "Paiement validé avec succès" : "Paiement rejeté"
            ));
            
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(Map.of("error", "Validation failed: " + e.getMessage()));
        }
    }
    
    /**
     * Get pending payments for admin validation
     */
    @GetMapping("/admin/pending")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getPendingPayments() {
        try {
            // Récupérer les vrais paiements en attente depuis la base de données
            java.util.List<Payment> pendingPayments = paymentProcessingService.getPendingPayments();
            
            // Convertir en DTO pour l'affichage admin
            java.util.List<Map<String, Object>> paymentDtos = pendingPayments.stream()
                .map(payment -> {
                    Map<String, Object> dto = new java.util.HashMap<>();
                    dto.put("id", payment.getId());
                    dto.put("paymentReference", payment.getPaymentReference());
                    dto.put("amount", payment.getAmount());
                    dto.put("paymentMethod", payment.getPaymentMethod().toString());
                    dto.put("status", payment.getStatus().toString());
                    dto.put("notes", payment.getNotes());
                    dto.put("paymentDate", payment.getPaymentDate().toString());
                    
                    // Informations de la facture et du client
                    if (payment.getInvoice() != null) {
                        dto.put("invoiceNumber", payment.getInvoice().getInvoiceNumber());
                        dto.put("invoiceId", payment.getInvoice().getId());
                        
                        if (payment.getInvoice().getReservation() != null && 
                            payment.getInvoice().getReservation().getClient() != null) {
                            var client = payment.getInvoice().getReservation().getClient();
                            dto.put("clientName", client.getFirstName() + " " + client.getLastName());
                            dto.put("clientEmail", client.getEmail());
                        }
                    }
                    
                    return dto;
                })
                .collect(java.util.stream.Collectors.toList());
            
            return ResponseEntity.ok(paymentDtos);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to get pending payments: " + e.getMessage()));
        }
    }

    /**
     * Get payment statistics
     */
    @GetMapping("/statistics")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> getPaymentStatistics() {
        try {
            Map<String, Object> stats = paymentProcessingService.getPaymentStatistics();
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to get statistics: " + e.getMessage()));
        }
    }
    
    /**
     * Get payment methods configuration
     */
    @GetMapping("/methods")
    public ResponseEntity<Map<String, Object>> getPaymentMethods() {
        try {
            Map<String, Object> methods = Map.of(
                "creditCard", Map.of(
                    "enabled", true,
                    "name", "Carte de crédit",
                    "description", "Paiement sécurisé par carte bancaire"
                ),
                "paypal", Map.of(
                    "enabled", true,
                    "name", "PayPal",
                    "description", "Paiement via PayPal"
                ),
                "bankTransfer", Map.of(
                    "enabled", true,
                    "name", "Virement bancaire",
                    "description", "Virement bancaire (validation manuelle)"
                ),
                "cash", Map.of(
                    "enabled", true,
                    "name", "Espèces",
                    "description", "Paiement en espèces"
                )
            );
            
            return ResponseEntity.ok(methods);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to get payment methods"));
        }
    }
}
