package com.aledhemtek.services;

import com.aledhemtek.model.Invoice;
import com.aledhemtek.model.Payment;
import com.aledhemtek.repositories.PaymentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@Service
public class PaymentProcessingService {
    
    private static final Logger logger = LoggerFactory.getLogger(PaymentProcessingService.class);
    
    @Autowired
    private PaymentRepository paymentRepository;
    
    @Autowired
    private EmailService emailService;
    
    @Value("${stripe.secret.key:}")
    private String stripeSecretKey;
    
    @Value("${paypal.client.id:}")
    private String paypalClientId;
    
    @Value("${paypal.client.secret:}")
    private String paypalClientSecret;
    
    /**
     * Process credit card payment via Stripe
     */
    public Payment processCreditCardPayment(Invoice invoice, Double amount, String stripeToken) {
        try {
            // Simulate Stripe payment processing
            // In real implementation, use Stripe API
            
            Payment payment = new Payment();
            payment.setInvoice(invoice);
            payment.setAmount(amount);
            payment.setPaymentMethod(Payment.PaymentMethod.CREDIT_CARD);
            payment.setPaymentReference(generatePaymentReference());
            payment.setTransactionId("stripe_" + UUID.randomUUID().toString().substring(0, 8));
            
            // Simulate payment processing
            if (simulatePaymentProcessing()) {
                payment.setStatus(Payment.PaymentStatus.VALIDATED);
                payment.setNotes("Payment processed successfully via Stripe");
                logger.info("Credit card payment processed successfully for invoice: {}", invoice.getInvoiceNumber());
            } else {
                payment.setStatus(Payment.PaymentStatus.FAILED);
                payment.setNotes("Payment failed - insufficient funds or invalid card");
                logger.warn("Credit card payment failed for invoice: {}", invoice.getInvoiceNumber());
            }
            
            Payment savedPayment = paymentRepository.save(payment);
            
            // Send confirmation email if payment successful
            if (payment.getStatus() == Payment.PaymentStatus.VALIDATED) {
                emailService.sendPaymentConfirmationEmail(invoice);
            }
            
            return savedPayment;
            
        } catch (Exception e) {
            logger.error("Error processing credit card payment: {}", e.getMessage());
            throw new RuntimeException("Payment processing failed: " + e.getMessage());
        }
    }
    
    /**
     * Process PayPal payment
     */
    public Payment processPayPalPayment(Invoice invoice, Double amount, String paypalPaymentId) {
        try {
            Payment payment = new Payment();
            payment.setInvoice(invoice);
            payment.setAmount(amount);
            payment.setPaymentMethod(Payment.PaymentMethod.PAYPAL);
            payment.setPaymentReference(generatePaymentReference());
            payment.setTransactionId("paypal_" + paypalPaymentId);
            
            // Simulate PayPal payment verification
            if (simulatePaymentProcessing()) {
                payment.setStatus(Payment.PaymentStatus.VALIDATED);
                payment.setNotes("Payment processed successfully via PayPal");
                logger.info("PayPal payment processed successfully for invoice: {}", invoice.getInvoiceNumber());
            } else {
                payment.setStatus(Payment.PaymentStatus.FAILED);
                payment.setNotes("PayPal payment verification failed");
                logger.warn("PayPal payment failed for invoice: {}", invoice.getInvoiceNumber());
            }
            
            Payment savedPayment = paymentRepository.save(payment);
            
            // Send confirmation email if payment successful
            if (payment.getStatus() == Payment.PaymentStatus.VALIDATED) {
                emailService.sendPaymentConfirmationEmail(invoice);
            }
            
            return savedPayment;
            
        } catch (Exception e) {
            logger.error("Error processing PayPal payment: {}", e.getMessage());
            throw new RuntimeException("PayPal payment processing failed: " + e.getMessage());
        }
    }
    
    /**
     * Process bank transfer payment
     */
    public Payment processBankTransferPayment(Invoice invoice, Double amount, String transferReference) {
        try {
            Payment payment = new Payment();
            payment.setInvoice(invoice);
            payment.setAmount(amount);
            payment.setPaymentMethod(Payment.PaymentMethod.BANK_TRANSFER);
            payment.setPaymentReference(generatePaymentReference());
            payment.setTransactionId("transfer_" + transferReference);
            payment.setStatus(Payment.PaymentStatus.PENDING); // Bank transfers need manual validation
            payment.setNotes("Bank transfer - awaiting validation");
            
            Payment savedPayment = paymentRepository.save(payment);
            logger.info("Bank transfer payment recorded for invoice: {}", invoice.getInvoiceNumber());
            
            return savedPayment;
            
        } catch (Exception e) {
            logger.error("Error processing bank transfer payment: {}", e.getMessage());
            throw new RuntimeException("Bank transfer processing failed: " + e.getMessage());
        }
    }
    
    /**
     * Process cash payment
     */
    public Payment processCashPayment(Invoice invoice, Double amount, String notes) {
        try {
            Payment payment = new Payment();
            payment.setInvoice(invoice);
            payment.setAmount(amount);
            payment.setPaymentMethod(Payment.PaymentMethod.CASH);
            payment.setPaymentReference(generatePaymentReference());
            payment.setTransactionId("cash_" + LocalDateTime.now().format(
                java.time.format.DateTimeFormatter.ofPattern("yyyyMMddHHmmss")));
            payment.setStatus(Payment.PaymentStatus.VALIDATED);
            payment.setNotes(notes != null ? notes : "Cash payment received");
            
            Payment savedPayment = paymentRepository.save(payment);
            logger.info("Cash payment processed for invoice: {}", invoice.getInvoiceNumber());
            
            // Send confirmation email
            emailService.sendPaymentConfirmationEmail(invoice);
            
            return savedPayment;
            
        } catch (Exception e) {
            logger.error("Error processing cash payment: {}", e.getMessage());
            throw new RuntimeException("Cash payment processing failed: " + e.getMessage());
        }
    }
    
    /**
     * Validate bank transfer payment
     */
    public Payment validateBankTransferPayment(Long paymentId, boolean approved, String notes) {
        try {
            Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new RuntimeException("Payment not found"));
            
            if (payment.getPaymentMethod() != Payment.PaymentMethod.BANK_TRANSFER) {
                throw new RuntimeException("Payment is not a bank transfer");
            }
            
            if (approved) {
                payment.setStatus(Payment.PaymentStatus.VALIDATED);
                payment.setNotes(payment.getNotes() + " - Validated: " + notes);
                emailService.sendPaymentConfirmationEmail(payment.getInvoice());
                logger.info("Bank transfer payment validated for invoice: {}", payment.getInvoice().getInvoiceNumber());
            } else {
                payment.setStatus(Payment.PaymentStatus.FAILED);
                payment.setNotes(payment.getNotes() + " - Rejected: " + notes);
                logger.info("Bank transfer payment rejected for invoice: {}", payment.getInvoice().getInvoiceNumber());
            }
            
            return paymentRepository.save(payment);
            
        } catch (Exception e) {
            logger.error("Error validating bank transfer payment: {}", e.getMessage());
            throw new RuntimeException("Payment validation failed: " + e.getMessage());
        }
    }
    
    /**
     * Create payment intent for online payments
     */
    public Map<String, Object> createPaymentIntent(Invoice invoice, Payment.PaymentMethod method) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            String clientSecret = "pi_" + UUID.randomUUID().toString().replace("-", "");
            
            response.put("clientSecret", clientSecret);
            response.put("amount", invoice.getRemainingAmount());
            response.put("currency", "eur");
            response.put("invoiceNumber", invoice.getInvoiceNumber());
            response.put("paymentMethod", method.toString());
            
            logger.info("Payment intent created for invoice: {}", invoice.getInvoiceNumber());
            
        } catch (Exception e) {
            logger.error("Error creating payment intent: {}", e.getMessage());
            response.put("error", "Failed to create payment intent");
        }
        
        return response;
    }
    
    /**
     * Generate unique payment reference
     */
    private String generatePaymentReference() {
        return "PAY-" + LocalDateTime.now().format(
            java.time.format.DateTimeFormatter.ofPattern("yyyyMMdd")) + 
            "-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
    }
    
    /**
     * Simulate payment processing (for demo purposes)
     * In real implementation, integrate with actual payment gateways
     */
    private boolean simulatePaymentProcessing() {
        // Simulate 95% success rate
        return Math.random() > 0.05;
    }
    
    /**
     * Get pending payments for admin validation
     */
    public java.util.List<Payment> getPendingPayments() {
        try {
            return paymentRepository.findByStatus(Payment.PaymentStatus.PENDING);
        } catch (Exception e) {
            logger.error("Error getting pending payments: {}", e.getMessage());
            return new java.util.ArrayList<>();
        }
    }

    /**
     * Validate any payment (supports all payment methods)
     */
    public Payment validatePayment(Long paymentId, boolean approved, String notes) {
        try {
            Optional<Payment> paymentOpt = paymentRepository.findById(paymentId);
            if (paymentOpt.isEmpty()) {
                throw new RuntimeException("Payment not found with ID: " + paymentId);
            }
            
            Payment payment = paymentOpt.get();
            
            if (approved) {
                payment.setStatus(Payment.PaymentStatus.VALIDATED);
                payment.setNotes(payment.getNotes() + " - Validé: " + notes);
                
                // Envoyer email de confirmation
                if (payment.getInvoice() != null) {
                    emailService.sendPaymentConfirmationEmail(payment.getInvoice());
                }
                
                logger.info("Payment validated for invoice: {}", 
                    payment.getInvoice() != null ? payment.getInvoice().getInvoiceNumber() : "N/A");
            } else {
                payment.setStatus(Payment.PaymentStatus.FAILED);
                payment.setNotes(payment.getNotes() + " - Rejeté: " + notes);
                
                logger.info("Payment rejected for invoice: {}", 
                    payment.getInvoice() != null ? payment.getInvoice().getInvoiceNumber() : "N/A");
            }
            
            return paymentRepository.save(payment);
            
        } catch (Exception e) {
            logger.error("Error validating payment: {}", e.getMessage());
            throw new RuntimeException("Payment validation failed: " + e.getMessage());
        }
    }

    /**
     * Get payment statistics
     */
    public Map<String, Object> getPaymentStatistics() {
        Map<String, Object> stats = new HashMap<>();
        
        try {
            long totalPayments = paymentRepository.count();
            long validatedPayments = paymentRepository.countByStatus(Payment.PaymentStatus.VALIDATED);
            long pendingPayments = paymentRepository.countByStatus(Payment.PaymentStatus.PENDING);
            long failedPayments = paymentRepository.countByStatus(Payment.PaymentStatus.FAILED);
            
            Double totalAmount = paymentRepository.sumAmountByStatus(Payment.PaymentStatus.VALIDATED);
            if (totalAmount == null) totalAmount = 0.0;
            
            stats.put("totalPayments", totalPayments);
            stats.put("validatedPayments", validatedPayments);
            stats.put("pendingPayments", pendingPayments);
            stats.put("failedPayments", failedPayments);
            stats.put("totalAmount", totalAmount);
            stats.put("successRate", totalPayments > 0 ? (double) validatedPayments / totalPayments * 100 : 0);
            
        } catch (Exception e) {
            logger.error("Error getting payment statistics: {}", e.getMessage());
            stats.put("error", "Failed to get statistics");
        }
        
        return stats;
    }
}
