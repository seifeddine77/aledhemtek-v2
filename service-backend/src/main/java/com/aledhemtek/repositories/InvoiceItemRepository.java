package com.aledhemtek.repositories;

import com.aledhemtek.model.InvoiceItem;
import com.aledhemtek.model.Invoice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface InvoiceItemRepository extends JpaRepository<InvoiceItem, Long> {
    
    /**
     * Find items by invoice
     */
    List<InvoiceItem> findByInvoice(Invoice invoice);
    
    /**
     * Find items by invoice ID
     */
    List<InvoiceItem> findByInvoiceId(Long invoiceId);
    
    /**
     * Find items by designation
     */
    List<InvoiceItem> findByDesignationContainingIgnoreCase(String designation);
    
    /**
     * Find items by task ID
     */
    List<InvoiceItem> findByTaskId(Long taskId);
    
    /**
     * Calculate total for invoice
     */
    @Query("SELECT SUM(ii.total) FROM InvoiceItem ii WHERE ii.invoice.id = :invoiceId")
    Double calculateTotalForInvoice(@Param("invoiceId") Long invoiceId);
    
    /**
     * Count items by invoice
     */
    Long countByInvoiceId(Long invoiceId);
    
    /**
     * Find most used designations
     */
    @Query("SELECT ii.designation, COUNT(ii) as count FROM InvoiceItem ii GROUP BY ii.designation ORDER BY count DESC")
    List<Object[]> findMostUsedDesignations();
}
