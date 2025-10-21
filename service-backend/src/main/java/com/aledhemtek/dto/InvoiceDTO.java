package com.aledhemtek.dto;

import com.aledhemtek.model.Invoice;
import java.time.LocalDateTime;
import java.util.List;

public class InvoiceDTO {
    
    private Long id;
    private String invoiceNumber;
    private LocalDateTime issueDate;
    private LocalDateTime dueDate;
    private Double totalAmount;
    private Double amountExclTax;
    private Double taxAmount;
    private Double taxRate;
    private Invoice.InvoiceStatus status;
    private String notes;
    private String pdfPath;
    private Long reservationId;
    private String clientName;
    private String clientEmail;
    private List<InvoiceItemDTO> items;
    private List<PaymentDTO> payments;
    private Double remainingAmount;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    // Constructors
    public InvoiceDTO() {}
    
    public InvoiceDTO(Invoice invoice) {
        this.id = invoice.getId();
        this.invoiceNumber = invoice.getInvoiceNumber();
        this.issueDate = invoice.getIssueDate();
        this.dueDate = invoice.getDueDate();
        this.totalAmount = invoice.getTotalAmount();
        this.amountExclTax = invoice.getAmountExclTax();
        this.taxAmount = invoice.getTaxAmount();
        this.taxRate = invoice.getTaxRate();
        this.status = invoice.getStatus();
        this.notes = invoice.getNotes();
        this.pdfPath = invoice.getPdfPath();
        this.createdAt = invoice.getCreatedAt();
        this.updatedAt = invoice.getUpdatedAt();
        
        if (invoice.getReservation() != null) {
            this.reservationId = invoice.getReservation().getId();
            if (invoice.getReservation().getClient() != null) {
                this.clientName = invoice.getReservation().getClient().getFirstName() + " " + 
                                invoice.getReservation().getClient().getLastName();
                this.clientEmail = invoice.getReservation().getClient().getEmail();
            }
        }
        
        this.remainingAmount = invoice.getRemainingAmount();
    }
    
    // Getters and Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public String getInvoiceNumber() {
        return invoiceNumber;
    }
    
    public void setInvoiceNumber(String invoiceNumber) {
        this.invoiceNumber = invoiceNumber;
    }
    
    public LocalDateTime getIssueDate() {
        return issueDate;
    }
    
    public void setIssueDate(LocalDateTime issueDate) {
        this.issueDate = issueDate;
    }
    
    public LocalDateTime getDueDate() {
        return dueDate;
    }
    
    public void setDueDate(LocalDateTime dueDate) {
        this.dueDate = dueDate;
    }
    
    public Double getTotalAmount() {
        return totalAmount;
    }
    
    public void setTotalAmount(Double totalAmount) {
        this.totalAmount = totalAmount;
    }
    
    public Double getAmountExclTax() {
        return amountExclTax;
    }
    
    public void setAmountExclTax(Double amountExclTax) {
        this.amountExclTax = amountExclTax;
    }
    
    public Double getTaxAmount() {
        return taxAmount;
    }
    
    public void setTaxAmount(Double taxAmount) {
        this.taxAmount = taxAmount;
    }
    
    public Double getTaxRate() {
        return taxRate;
    }
    
    public void setTaxRate(Double taxRate) {
        this.taxRate = taxRate;
    }
    
    public Invoice.InvoiceStatus getStatus() {
        return status;
    }
    
    public void setStatus(Invoice.InvoiceStatus status) {
        this.status = status;
    }
    
    public String getNotes() {
        return notes;
    }
    
    public void setNotes(String notes) {
        this.notes = notes;
    }
    
    public String getPdfPath() {
        return pdfPath;
    }
    
    public void setPdfPath(String pdfPath) {
        this.pdfPath = pdfPath;
    }
    
    public Long getReservationId() {
        return reservationId;
    }
    
    public void setReservationId(Long reservationId) {
        this.reservationId = reservationId;
    }
    
    public String getClientName() {
        return clientName;
    }
    
    public void setClientName(String clientName) {
        this.clientName = clientName;
    }
    
    public String getClientEmail() {
        return clientEmail;
    }
    
    public void setClientEmail(String clientEmail) {
        this.clientEmail = clientEmail;
    }
    
    public List<InvoiceItemDTO> getItems() {
        return items;
    }
    
    public void setItems(List<InvoiceItemDTO> items) {
        this.items = items;
    }
    
    public List<PaymentDTO> getPayments() {
        return payments;
    }
    
    public void setPayments(List<PaymentDTO> payments) {
        this.payments = payments;
    }
    
    public Double getRemainingAmount() {
        return remainingAmount;
    }
    
    public void setRemainingAmount(Double remainingAmount) {
        this.remainingAmount = remainingAmount;
    }
    
    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
    
    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
    
    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
    
    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}
