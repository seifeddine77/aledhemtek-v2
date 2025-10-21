package com.aledhemtek.repositories;

import com.aledhemtek.model.Invoice;
import com.aledhemtek.model.Reservation;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface InvoiceRepository extends JpaRepository<Invoice, Long> {
    
    /**
     * Find invoice by invoice number
     */
    Optional<Invoice> findByInvoiceNumber(String invoiceNumber);
    
    /**
     * Find invoice by ID with all related entities (items and payments)
     */
    @EntityGraph(attributePaths = {"invoiceItems", "reservation", "reservation.client"})
    Optional<Invoice> findWithDetailsById(Long id);
    
    /**
     * Find invoices by reservation
     */
    List<Invoice> findByReservation(Reservation reservation);
    
    /**
     * Find invoices by reservation ID
     */
    List<Invoice> findByReservation_Id(Long reservationId);
    
    /**
     * Find invoices by status
     */
    List<Invoice> findByStatus(Invoice.InvoiceStatus status);
    
    /**
     * Find invoices by status with pagination
     */
    Page<Invoice> findByStatus(Invoice.InvoiceStatus status, Pageable pageable);
    
    /**
     * Find invoices by date range
     */
    @Query("SELECT i FROM Invoice i WHERE i.issueDate BETWEEN :startDate AND :endDate")
    List<Invoice> findByIssueDateBetween(@Param("startDate") LocalDateTime startDate, 
                                        @Param("endDate") LocalDateTime endDate);
    
    /**
     * Find invoices by due date range
     */
    @Query("SELECT i FROM Invoice i WHERE i.dueDate BETWEEN :startDate AND :endDate")
    List<Invoice> findByDueDateBetween(@Param("startDate") LocalDateTime startDate, 
                                      @Param("endDate") LocalDateTime endDate);
    
    /**
     * Find overdue invoices
     */
    @Query("SELECT i FROM Invoice i WHERE i.dueDate < :currentDate AND i.status != 'PAID'")
    List<Invoice> findOverdueInvoices(@Param("currentDate") LocalDateTime currentDate);
    
    /**
     * Find unpaid invoices
     */
    @Query("SELECT i FROM Invoice i WHERE i.status IN ('PENDING', 'SENT', 'OVERDUE')")
    List<Invoice> findUnpaidInvoices();
    
    /**
     * Find invoices by client (through reservation)
     */
    @Query("SELECT i FROM Invoice i WHERE i.reservation.client.id = :clientId")
    List<Invoice> findByClientId(@Param("clientId") Long clientId);
    
    /**
     * Find invoices by client with pagination
     */
    @Query("SELECT i FROM Invoice i WHERE i.reservation.client.id = :clientId")
    Page<Invoice> findByClientId(@Param("clientId") Long clientId, Pageable pageable);
    
    /**
     * Calculate total amount for a client
     */
    @Query("SELECT SUM(i.totalAmount) FROM Invoice i WHERE i.reservation.client.id = :clientId")
    Double calculateTotalAmountByClientId(@Param("clientId") Long clientId);
    
    /**
     * Calculate total unpaid amount for a client
     */
    @Query("SELECT SUM(i.totalAmount) FROM Invoice i WHERE i.reservation.client.id = :clientId AND i.status IN ('PENDING', 'SENT', 'OVERDUE')")
    Double calculateUnpaidAmountByClientId(@Param("clientId") Long clientId);
    
    /**
     * Find recent invoices (last 30 days)
     */
    @Query("SELECT i FROM Invoice i WHERE i.issueDate >= :thirtyDaysAgo ORDER BY i.issueDate DESC")
    List<Invoice> findRecentInvoices(@Param("thirtyDaysAgo") LocalDateTime thirtyDaysAgo);
    
    /**
     * Count invoices by status
     */
    Long countByStatus(Invoice.InvoiceStatus status);
    
    /**
     * Find invoices with total amount greater than specified value
     */
    @Query("SELECT i FROM Invoice i WHERE i.totalAmount > :amount")
    List<Invoice> findByTotalAmountGreaterThan(@Param("amount") Double amount);
    
    /**
     * Search invoices by invoice number or client name
     */
    @Query("SELECT i FROM Invoice i WHERE " +
           "LOWER(i.invoiceNumber) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "LOWER(i.reservation.client.firstName) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "LOWER(i.reservation.client.lastName) LIKE LOWER(CONCAT('%', :searchTerm, '%'))")
    List<Invoice> searchInvoices(@Param("searchTerm") String searchTerm);
    
    /**
     * Search invoices with pagination
     */
    @Query("SELECT i FROM Invoice i WHERE " +
           "LOWER(i.invoiceNumber) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "LOWER(i.reservation.client.firstName) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "LOWER(i.reservation.client.lastName) LIKE LOWER(CONCAT('%', :searchTerm, '%'))")
    Page<Invoice> searchInvoices(@Param("searchTerm") String searchTerm, Pageable pageable);
    
    /**
     * Get monthly revenue
     */
    @Query("SELECT SUM(i.totalAmount) FROM Invoice i WHERE " +
           "YEAR(i.issueDate) = :year AND MONTH(i.issueDate) = :month AND i.status = 'PAID'")
    Double getMonthlyRevenue(@Param("year") int year, @Param("month") int month);
    
    /**
     * Get yearly revenue
     */
    @Query("SELECT SUM(i.totalAmount) FROM Invoice i WHERE " +
           "YEAR(i.issueDate) = :year AND i.status = 'PAID'")
    Double getYearlyRevenue(@Param("year") int year);
}
