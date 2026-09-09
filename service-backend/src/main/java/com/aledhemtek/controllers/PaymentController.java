package com.aledhemtek.controllers;

import com.aledhemtek.config.CustomUserDetails;
import com.aledhemtek.interfaces.InvoiceService;
import com.aledhemtek.model.Invoice;
import com.aledhemtek.model.Payment;
import com.aledhemtek.services.PaymentProcessingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/payments")
@CrossOrigin(origins = "http://localhost:4200")
public class PaymentController {
    
    @Autowired
    private PaymentProcessingService paymentProcessingService;
    
    @Autowired
    private InvoiceService invoiceService;

    private boolean isAdmin(Authentication authentication) {
        if (authentication == null) return false;
        return authentication.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN") || a.getAuthority().equals("ADMIN"));
    }

    private Long getAuthenticatedUserId(Authentication authentication) {
        if (authentication != null && authentication.getPrincipal() instanceof CustomUserDetails) {
            return ((CustomUserDetails) authentication.getPrincipal()).getUser().getId();
        }
        return null;
    }

    private String getAuthenticatedUserEmail(Authentication authentication) {
        if (authentication != null) {
            return authentication.getName();
        }
        return null;
    }

    private boolean isOwnerOrAdmin(Invoice invoice, Authentication authentication) {
        if (isAdmin(authentication)) return true;
        if (invoice == null || invoice.getReservation() == null || invoice.getReservation().getClient() == null) {
            return false;
        }
        String userEmail = getAuthenticatedUserEmail(authentication);
        return userEmail != null && userEmail.equalsIgnoreCase(invoice.getReservation().getClient().getEmail());
    }
    
    /**
     * Create payment intent for online payment (Protégé contre l'IDOR)
     */
    @PostMapping("/create-intent")
    @PreAuthorize("hasRole('CLIENT') or hasRole('ADMIN')")
    public ResponseEntity<?> createPaymentIntent(
            @RequestBody Map<String, Object> request,
            Authentication authentication) {
        try {
            Long invoiceId = Long.valueOf(request.get("invoiceId").toString());
            String paymentMethodStr = request.getOrDefault("paymentMethod", "CREDIT_CARD").toString();
            Payment.PaymentMethod paymentMethod = Payment.PaymentMethod.valueOf(paymentMethodStr.toUpperCase());
            
            Optional<Invoice> invoiceOpt = invoiceService.getInvoiceById(invoiceId);
            if (invoiceOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "Facture introuvable"));
            }
            
            Invoice invoice = invoiceOpt.get();
            if (!isOwnerOrAdmin(invoice, authentication)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(Map.of("error", "Accès refusé - Vous n'êtes pas autorisé à payer cette facture"));
            }
            
            Map<String, Object> intent = paymentProcessingService.createPaymentIntent(invoice, paymentMethod);
            return ResponseEntity.ok(intent);
            
        } catch (IllegalArgumentException | IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Échec création intention paiement: " + e.getMessage()));
        }
    }
    
    /**
     * Process credit card payment (Validation stricte & Idempotence)
     */
    @PostMapping("/credit-card")
    @PreAuthorize("hasRole('CLIENT') or hasRole('ADMIN')")
    public ResponseEntity<?> processCreditCardPayment(
            @RequestBody Map<String, Object> request,
            @RequestHeader(value = "Idempotency-Key", required = false) String headerIdempotencyKey,
            Authentication authentication) {
        try {
            Long invoiceId = Long.valueOf(request.get("invoiceId").toString());
            Double amount = Double.valueOf(request.get("amount").toString());
            String stripeToken = request.getOrDefault("stripeToken", "tok_visa").toString();
            String idempotencyKey = request.containsKey("idempotencyKey") ? 
                    request.get("idempotencyKey").toString() : headerIdempotencyKey;
            
            Optional<Invoice> invoiceOpt = invoiceService.getInvoiceById(invoiceId);
            if (invoiceOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "Facture introuvable"));
            }

            Invoice invoice = invoiceOpt.get();
            if (!isOwnerOrAdmin(invoice, authentication)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(Map.of("error", "Accès refusé - Facture non associée à votre compte"));
            }
            
            Payment payment = paymentProcessingService.processCreditCardPayment(
                invoice, amount, stripeToken, idempotencyKey);
            
            return ResponseEntity.ok(Map.of(
                "status", "success",
                "paymentId", payment.getId(),
                "paymentReference", payment.getPaymentReference(),
                "transactionId", payment.getTransactionId() != null ? payment.getTransactionId() : "",
                "paymentStatus", payment.getStatus().toString(),
                "message", payment.getStatus() == Payment.PaymentStatus.VALIDATED ? 
                    "Paiement carte bancaire validé avec succès" : "Paiement carte bancaire rejeté"
            ));
            
        } catch (IllegalArgumentException | IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(Map.of("error", "Échec du paiement carte: " + e.getMessage()));
        }
    }
    
    /**
     * Process PayPal payment
     */
    @PostMapping("/paypal")
    @PreAuthorize("hasRole('CLIENT') or hasRole('ADMIN')")
    public ResponseEntity<?> processPayPalPayment(
            @RequestBody Map<String, Object> request,
            @RequestHeader(value = "Idempotency-Key", required = false) String headerIdempotencyKey,
            Authentication authentication) {
        try {
            Long invoiceId = Long.valueOf(request.get("invoiceId").toString());
            Double amount = Double.valueOf(request.get("amount").toString());
            String paypalPaymentId = request.getOrDefault("paypalPaymentId", "PAYID-" + UUID.randomUUID().toString().substring(0, 8)).toString();
            String idempotencyKey = request.containsKey("idempotencyKey") ? 
                    request.get("idempotencyKey").toString() : headerIdempotencyKey;
            
            Optional<Invoice> invoiceOpt = invoiceService.getInvoiceById(invoiceId);
            if (invoiceOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "Facture introuvable"));
            }

            Invoice invoice = invoiceOpt.get();
            if (!isOwnerOrAdmin(invoice, authentication)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(Map.of("error", "Accès refusé - Facture non associée à votre compte"));
            }
            
            Payment payment = paymentProcessingService.processPayPalPayment(
                invoice, amount, paypalPaymentId, idempotencyKey);
            
            return ResponseEntity.ok(Map.of(
                "status", "success",
                "paymentId", payment.getId(),
                "paymentReference", payment.getPaymentReference(),
                "transactionId", payment.getTransactionId() != null ? payment.getTransactionId() : "",
                "paymentStatus", payment.getStatus().toString(),
                "message", "Paiement PayPal validé avec succès"
            ));
            
        } catch (IllegalArgumentException | IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(Map.of("error", "Échec du paiement PayPal: " + e.getMessage()));
        }
    }
    
    /**
     * Process bank transfer payment (Admin)
     */
    @PostMapping("/bank-transfer")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> processBankTransferPayment(
            @RequestBody Map<String, Object> request,
            @RequestHeader(value = "Idempotency-Key", required = false) String headerIdempotencyKey) {
        try {
            Long invoiceId = Long.valueOf(request.get("invoiceId").toString());
            Double amount = Double.valueOf(request.get("amount").toString());
            String transferReference = request.get("transferReference").toString();
            String idempotencyKey = request.containsKey("idempotencyKey") ? 
                    request.get("idempotencyKey").toString() : headerIdempotencyKey;
            
            Optional<Invoice> invoiceOpt = invoiceService.getInvoiceById(invoiceId);
            if (invoiceOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "Facture introuvable"));
            }
            
            Payment payment = paymentProcessingService.processBankTransferPayment(
                invoiceOpt.get(), amount, transferReference, idempotencyKey);
            
            return ResponseEntity.ok(Map.of(
                "status", "success",
                "paymentId", payment.getId(),
                "paymentReference", payment.getPaymentReference(),
                "paymentStatus", payment.getStatus().toString(),
                "message", "Virement bancaire enregistré en attente de rapprochement"
            ));
            
        } catch (IllegalArgumentException | IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(Map.of("error", "Échec virement bancaire: " + e.getMessage()));
        }
    }
    
    /**
     * Process cash payment (Admin)
     */
    @PostMapping("/cash")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> processCashPayment(
            @RequestBody Map<String, Object> request,
            @RequestHeader(value = "Idempotency-Key", required = false) String headerIdempotencyKey) {
        try {
            Long invoiceId = Long.valueOf(request.get("invoiceId").toString());
            Double amount = Double.valueOf(request.get("amount").toString());
            String notes = request.getOrDefault("notes", "").toString();
            String idempotencyKey = request.containsKey("idempotencyKey") ? 
                    request.get("idempotencyKey").toString() : headerIdempotencyKey;
            
            Optional<Invoice> invoiceOpt = invoiceService.getInvoiceById(invoiceId);
            if (invoiceOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "Facture introuvable"));
            }
            
            Payment payment = paymentProcessingService.processCashPayment(
                invoiceOpt.get(), amount, notes, idempotencyKey);
            
            return ResponseEntity.ok(Map.of(
                "status", "success",
                "paymentId", payment.getId(),
                "paymentReference", payment.getPaymentReference(),
                "paymentStatus", payment.getStatus().toString(),
                "message", "Paiement en espèces validé"
            ));
            
        } catch (IllegalArgumentException | IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(Map.of("error", "Échec paiement espèces: " + e.getMessage()));
        }
    }

    /**
     * Get payment details by ID (Protégé : Client propriétaire ou Admin)
     */
    @GetMapping("/{paymentId}")
    @PreAuthorize("hasRole('CLIENT') or hasRole('ADMIN')")
    public ResponseEntity<?> getPaymentById(@PathVariable Long paymentId, Authentication authentication) {
        try {
            Payment payment = paymentProcessingService.getPaymentById(paymentId);
            if (!isOwnerOrAdmin(payment.getInvoice(), authentication)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(Map.of("error", "Accès refusé à ce paiement"));
            }
            return ResponseEntity.ok(transformPaymentToMap(payment));
        } catch (NoSuchElementException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Erreur lors de la récupération du paiement"));
        }
    }

    /**
     * Get payment history for a client (Protection anti-IDOR)
     */
    @GetMapping("/client/{clientId}/history")
    @PreAuthorize("hasRole('CLIENT') or hasRole('ADMIN')")
    public ResponseEntity<?> getClientPaymentHistory(@PathVariable Long clientId, Authentication authentication) {
        try {
            if (!isAdmin(authentication)) {
                Long authUserId = getAuthenticatedUserId(authentication);
                if (authUserId == null || !authUserId.equals(clientId)) {
                    return ResponseEntity.status(HttpStatus.FORBIDDEN)
                            .body(Map.of("error", "Accès refusé - Vous ne pouvez consulter que votre propre historique"));
                }
            }
            List<Payment> history = paymentProcessingService.getClientPaymentHistory(clientId);
            List<Map<String, Object>> dtos = history.stream().map(this::transformPaymentToMap).toList();
            return ResponseEntity.ok(dtos);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Échec de récupération de l'historique des paiements"));
        }
    }

    /**
     * Verify payment transaction
     */
    @GetMapping("/verify/{transactionId}")
    @PreAuthorize("hasRole('CLIENT') or hasRole('ADMIN')")
    public ResponseEntity<?> verifyPayment(@PathVariable String transactionId) {
        Map<String, Object> result = paymentProcessingService.verifyPaymentStatus(transactionId);
        return ResponseEntity.ok(result);
    }

    /**
     * Cancel a payment (Client ou Admin)
     */
    @PostMapping("/{paymentId}/cancel")
    @PreAuthorize("hasRole('CLIENT') or hasRole('ADMIN')")
    public ResponseEntity<?> cancelPayment(
            @PathVariable Long paymentId,
            @RequestBody(required = false) Map<String, Object> body,
            Authentication authentication) {
        try {
            Payment payment = paymentProcessingService.getPaymentById(paymentId);
            if (!isOwnerOrAdmin(payment.getInvoice(), authentication)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(Map.of("error", "Accès refusé"));
            }
            String reason = (body != null && body.containsKey("reason")) ? body.get("reason").toString() : "Annulation demandée";
            Payment cancelled = paymentProcessingService.cancelPayment(paymentId, reason);
            return ResponseEntity.ok(Map.of(
                "status", "success",
                "paymentId", cancelled.getId(),
                "paymentStatus", cancelled.getStatus().toString(),
                "message", "Paiement annulé avec succès"
            ));
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", e.getMessage()));
        } catch (NoSuchElementException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Refund a payment (Admin uniquement)
     */
    @PostMapping("/{paymentId}/refund")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> refundPayment(
            @PathVariable Long paymentId,
            @RequestBody(required = false) Map<String, Object> body) {
        try {
            Double amount = (body != null && body.containsKey("amount")) ? 
                    Double.valueOf(body.get("amount").toString()) : null;
            String reason = (body != null && body.containsKey("reason")) ? 
                    body.get("reason").toString() : "Remboursement initié par l'administrateur";
            
            Payment refunded = paymentProcessingService.refundPayment(paymentId, amount, reason);
            return ResponseEntity.ok(Map.of(
                "status", "success",
                "paymentId", refunded.getId(),
                "paymentStatus", refunded.getStatus().toString(),
                "message", "Paiement remboursé avec succès"
            ));
        } catch (IllegalArgumentException | IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", e.getMessage()));
        } catch (NoSuchElementException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Webhook externe sécurisé (Stripe / PayPal)
     */
    @PostMapping("/webhook")
    public ResponseEntity<?> handleWebhook(
            @RequestBody(required = false) String payload,
            @RequestHeader(value = "Stripe-Signature", required = false) String stripeSignature,
            @RequestHeader(value = "Paypal-Transmission-Id", required = false) String paypalTransmissionId) {
        String signature = stripeSignature != null ? stripeSignature : paypalTransmissionId;
        Map<String, Object> result = paymentProcessingService.handleWebhook(payload, signature);
        return ResponseEntity.ok(result);
    }
    
    /**
     * Validate payment manually (Admin)
     */
    @PostMapping("/{paymentId}/validate")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> validatePayment(
            @PathVariable Long paymentId,
            @RequestBody Map<String, Object> request) {
        try {
            boolean approved = Boolean.parseBoolean(request.get("approved").toString());
            String notes = request.getOrDefault("notes", "").toString();
            
            Payment payment = paymentProcessingService.validatePayment(paymentId, approved, notes);
            
            return ResponseEntity.ok(Map.of(
                "status", "success",
                "paymentId", payment.getId(),
                "paymentStatus", payment.getStatus().toString(),
                "message", approved ? "Paiement validé avec succès" : "Paiement rejeté"
            ));
            
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(Map.of("error", "Validation échouée: " + e.getMessage()));
        }
    }
    
    /**
     * Get pending payments for admin validation
     */
    @GetMapping("/admin/pending")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getPendingPayments() {
        try {
            List<Payment> pendingPayments = paymentProcessingService.getPendingPayments();
            List<Map<String, Object>> paymentDtos = pendingPayments.stream()
                .map(this::transformPaymentToMap)
                .toList();
            return ResponseEntity.ok(paymentDtos);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Échec récupération paiements en attente: " + e.getMessage()));
        }
    }

    /**
     * Get all payments for admin with pagination and filters
     */
    @GetMapping("/admin/all")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getAllPaymentsAdmin(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "paymentDate") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir,
            @RequestParam(required = false) String status) {
        try {
            Sort sort = sortDir.equalsIgnoreCase("desc") ?
                    Sort.by(sortBy).descending() :
                    Sort.by(sortBy).ascending();
            Pageable pageable = PageRequest.of(page, size, sort);
            
            Payment.PaymentStatus paymentStatus = null;
            if (status != null && !status.isBlank() && !status.equalsIgnoreCase("ALL")) {
                paymentStatus = Payment.PaymentStatus.valueOf(status.toUpperCase());
            }
            
            Page<Payment> paymentsPage = paymentProcessingService.getAllPayments(pageable, paymentStatus);
            List<Map<String, Object>> dtos = paymentsPage.getContent().stream()
                .map(this::transformPaymentToMap)
                .toList();
            
            Map<String, Object> response = new HashMap<>();
            response.put("content", dtos);
            response.put("totalElements", paymentsPage.getTotalElements());
            response.put("totalPages", paymentsPage.getTotalPages());
            response.put("size", paymentsPage.getSize());
            response.put("number", paymentsPage.getNumber());
            response.put("first", paymentsPage.isFirst());
            response.put("last", paymentsPage.isLast());
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Échec consultation paiements admin: " + e.getMessage()));
        }
    }

    /**
     * Validate multiple payments at once
     */
    @PostMapping("/admin/validate-multiple")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> validateMultiplePayments(@RequestBody Map<String, Object> request) {
        try {
            @SuppressWarnings("unchecked")
            List<Integer> paymentIdsInt = (List<Integer>) request.get("paymentIds");
            boolean approved = Boolean.parseBoolean(request.get("approved").toString());
            String notes = request.getOrDefault("notes", "").toString();
            
            List<Long> paymentIds = paymentIdsInt.stream().map(Long::valueOf).toList();
            List<Payment> validated = paymentProcessingService.validateMultiplePayments(paymentIds, approved, notes);
            
            return ResponseEntity.ok(Map.of(
                "status", "success",
                "count", validated.size(),
                "message", approved ? validated.size() + " paiements validés avec succès" : validated.size() + " paiements rejetés"
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", "Validation multiple échouée: " + e.getMessage()));
        }
    }

    /**
     * Get payment statistics
     */
    @GetMapping("/statistics")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getPaymentStatistics() {
        try {
            Map<String, Object> stats = paymentProcessingService.getPaymentStatistics();
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Échec calcul statistiques: " + e.getMessage()));
        }
    }
    
    /**
     * Get payment methods configuration
     */
    @GetMapping("/methods")
    public ResponseEntity<Map<String, Object>> getPaymentMethods() {
        Map<String, Object> methods = Map.of(
            "creditCard", Map.of(
                "enabled", true,
                "name", "Carte bancaire",
                "description", "Paiement sécurisé par carte bancaire via Stripe"
            ),
            "paypal", Map.of(
                "enabled", true,
                "name", "PayPal",
                "description", "Paiement sécurisé via votre compte PayPal"
            ),
            "bankTransfer", Map.of(
                "enabled", true,
                "name", "Virement bancaire",
                "description", "Virement bancaire SEPA (validation sous 24-48h)"
            ),
            "cash", Map.of(
                "enabled", true,
                "name", "Espèces",
                "description", "Paiement en espèces remis en mains propres"
            )
        );
        return ResponseEntity.ok(methods);
    }

    private Map<String, Object> transformPaymentToMap(Payment payment) {
        Map<String, Object> dto = new HashMap<>();
        dto.put("id", payment.getId());
        dto.put("paymentReference", payment.getPaymentReference());
        dto.put("amount", payment.getAmount());
        dto.put("currency", payment.getCurrency() != null ? payment.getCurrency() : "EUR");
        dto.put("paymentMethod", payment.getPaymentMethod() != null ? payment.getPaymentMethod().toString() : "OTHER");
        dto.put("status", payment.getStatus() != null ? payment.getStatus().toString() : "PENDING");
        dto.put("transactionId", payment.getTransactionId());
        dto.put("notes", payment.getNotes());
        dto.put("paymentDate", payment.getPaymentDate() != null ? payment.getPaymentDate().toString() : null);
        dto.put("createdAt", payment.getCreatedAt() != null ? payment.getCreatedAt().toString() : null);
        dto.put("updatedAt", payment.getUpdatedAt() != null ? payment.getUpdatedAt().toString() : null);
        
        if (payment.getInvoice() != null) {
            dto.put("invoiceId", payment.getInvoice().getId());
            dto.put("invoiceNumber", payment.getInvoice().getInvoiceNumber());
            dto.put("invoiceTotalAmount", payment.getInvoice().getTotalAmount());
            dto.put("invoiceRemainingAmount", payment.getInvoice().getRemainingAmount());
            
            if (payment.getInvoice().getReservation() != null && 
                payment.getInvoice().getReservation().getClient() != null) {
                var client = payment.getInvoice().getReservation().getClient();
                dto.put("clientId", client.getId());
                dto.put("clientName", client.getFirstName() + " " + client.getLastName());
                dto.put("clientEmail", client.getEmail());
            }
        }
        return dto;
    }
}
