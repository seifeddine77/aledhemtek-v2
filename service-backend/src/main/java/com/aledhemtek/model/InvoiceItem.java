package com.aledhemtek.model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "invoice_item")
public class InvoiceItem {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "designation", nullable = false)
    private String designation;
    
    @Column(name = "description", columnDefinition = "TEXT")
    private String description;
    
    @Column(name = "quantity", nullable = false)
    private Integer quantity;
    
    @Column(name = "unit_price", nullable = false)
    private Double unitPrice;
    
    @Column(name = "total", nullable = false)
    private Double total;
    
    @Column(name = "tax_rate")
    private Double taxRate = 20.0;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "invoice_id", nullable = false)
    @JsonBackReference
    private Invoice invoice;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "task_id")
    private Task task; // Reference to task if applicable
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    // Constructors
    public InvoiceItem() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }
    
    public InvoiceItem(String designation, Integer quantity, Double unitPrice) {
        this();
        this.designation = designation;
        this.quantity = quantity;
        this.unitPrice = unitPrice;
        this.calculateTotal();
    }
    
    public InvoiceItem(Task task, Integer quantity, Double unitPrice) {
        this();
        this.task = task;
        this.designation = task.getName();
        this.description = task.getDescription();
        this.quantity = quantity;
        this.unitPrice = unitPrice;
        this.calculateTotal();
    }
    
    // Utility methods
    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
        this.calculateTotal();
    }
    
    @PrePersist
    public void prePersist() {
        this.calculateTotal();
    }
    
    /**
     * Calculate line total (quantity × unit price)
     */
    public Double calculateTotal() {
        if (this.unitPrice == null) {
            System.err.println("[ERROR] InvoiceItem.calculateTotal() - unitPrice is null for item: " + this.description);
            this.unitPrice = 0.0; // Fallback value
        }
        if (this.quantity == null) {
            System.err.println("[ERROR] InvoiceItem.calculateTotal() - quantity is null for item: " + this.description);
            this.quantity = 1; // Fallback value
        }
        this.total = this.quantity * this.unitPrice;
        System.out.println("[DEBUG] InvoiceItem.calculateTotal() - Item: " + this.description + ", Qty: " + this.quantity + ", Price: " + this.unitPrice + ", Total: " + this.total);
        return this.total;
    }
    
    /**
     * Calculate amount excluding tax
     */
    public Double getAmountExclTax() {
        return this.total / (1 + (this.taxRate / 100));
    }
    
    /**
     * Calculate tax amount
     */
    public Double getTaxAmount() {
        return this.total - this.getAmountExclTax();
    }
    
    // Getters and Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public String getDesignation() {
        return designation;
    }
    
    public void setDesignation(String designation) {
        this.designation = designation;
    }
    
    public String getDescription() {
        return description;
    }
    
    public void setDescription(String description) {
        this.description = description;
    }
    
    public Integer getQuantity() {
        return quantity;
    }
    
    public void setQuantity(Integer quantity) {
        this.quantity = quantity;
        this.calculateTotal();
    }
    
    public Double getUnitPrice() {
        return unitPrice;
    }
    
    public void setUnitPrice(Double unitPrice) {
        this.unitPrice = unitPrice;
        this.calculateTotal();
    }
    
    public Double getTotal() {
        return total;
    }
    
    public void setTotal(Double total) {
        this.total = total;
    }
    
    public Double getTaxRate() {
        return taxRate;
    }
    
    public void setTaxRate(Double taxRate) {
        this.taxRate = taxRate;
    }
    
    public Invoice getInvoice() {
        return invoice;
    }
    
    public void setInvoice(Invoice invoice) {
        this.invoice = invoice;
    }
    
    public Task getTask() {
        return task;
    }
    
    public void setTask(Task task) {
        this.task = task;
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
