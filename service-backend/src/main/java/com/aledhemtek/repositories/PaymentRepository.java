package com.aledhemtek.repositories;

import com.aledhemtek.model.Payment;
import com.aledhemtek.model.Invoice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {
    
    /**
     * Find payment by reference
     */
    Optional<Payment> findByPaymentReference(String paymentReference);
    
    /**
     * Find payments by invoice
     */
    List<Payment> findByInvoice(Invoice invoice);
    
    /**
     * Find payments by invoice ID
     */
    List<Payment> findByInvoiceId(Long invoiceId);
    
    /**
     * Find payments by status
     */
    List<Payment> findByStatus(Payment.PaymentStatus status);
    
    /**
     * Find payments by payment method
     */
    List<Payment> findByPaymentMethod(Payment.PaymentMethod paymentMethod);
    
    /**
     * Find payments by date range
     */
    @Query("SELECT p FROM Payment p WHERE p.paymentDate BETWEEN :startDate AND :endDate")
    List<Payment> findByPaymentDateBetween(@Param("startDate") LocalDateTime startDate, 
                                          @Param("endDate") LocalDateTime endDate);
    
    /**
     * Count payments by status
     */
    long countByStatus(Payment.PaymentStatus status);
    
    /**
     * Sum amount by status
     */
    @Query("SELECT COALESCE(SUM(p.amount), 0.0) FROM Payment p WHERE p.status = :status")
    Double sumAmountByStatus(@Param("status") Payment.PaymentStatus status);
    
    /**
     * Find payments by transaction ID
     */
    Optional<Payment> findByTransactionId(String transactionId);
    
    /**
     * Calculate total payments for invoice
     */
    @Query("SELECT SUM(p.amount) FROM Payment p WHERE p.invoice.id = :invoiceId AND p.status = 'VALIDATED'")
    Double calculateTotalPaymentsForInvoice(@Param("invoiceId") Long invoiceId);
    
    /**
     * Find validated payments by client
     */
    @Query("SELECT p FROM Payment p WHERE p.invoice.reservation.client.id = :clientId AND p.status = 'VALIDATED'")
    List<Payment> findValidatedPaymentsByClientId(@Param("clientId") Long clientId);
    
    /**
     * Calculate total payments by client
     */
    @Query("SELECT SUM(p.amount) FROM Payment p WHERE p.invoice.reservation.client.id = :clientId AND p.status = 'VALIDATED'")
    Double calculateTotalPaymentsByClientId(@Param("clientId") Long clientId);
    
    /**
     * Find recent payments (last 30 days)
     */
    @Query("SELECT p FROM Payment p WHERE p.paymentDate >= :thirtyDaysAgo ORDER BY p.paymentDate DESC")
    List<Payment> findRecentPayments(@Param("thirtyDaysAgo") LocalDateTime thirtyDaysAgo);
    

    
    /**
     * Find pending payments older than specified days
     */
    @Query("SELECT p FROM Payment p WHERE p.status = 'PENDING' AND p.createdAt < :cutoffDate")
    List<Payment> findOldPendingPayments(@Param("cutoffDate") LocalDateTime cutoffDate);
    
    /**
     * Get daily revenue
     */
    @Query("SELECT SUM(p.amount) FROM Payment p WHERE " +
           "DATE(p.paymentDate) = DATE(:date) AND p.status = 'VALIDATED'")
    Double getDailyRevenue(@Param("date") LocalDateTime date);
    
    /**
     * Get monthly revenue by payment method
     */
    @Query("SELECT p.paymentMethod, SUM(p.amount) FROM Payment p WHERE " +
           "YEAR(p.paymentDate) = :year AND MONTH(p.paymentDate) = :month AND p.status = 'VALIDATED' " +
           "GROUP BY p.paymentMethod")
    List<Object[]> getMonthlyRevenueByPaymentMethod(@Param("year") int year, @Param("month") int month);
    
    /**
     * Count pending payments
     */
    @Query("SELECT COUNT(p) FROM Payment p WHERE p.status = 'PENDING'")
    Long countPendingPayments();
}
