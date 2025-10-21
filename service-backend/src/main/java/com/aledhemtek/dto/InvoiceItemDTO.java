package com.aledhemtek.dto;

import com.aledhemtek.model.InvoiceItem;
import java.time.LocalDateTime;

public class InvoiceItemDTO {
    
    private Long id;
    private String designation;
    private String description;
    private Integer quantity;
    private Double unitPrice;
    private Double total;
    private Double taxRate;
    private Long taskId;
    private String taskName;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    // Constructors
    public InvoiceItemDTO() {}
    
    public InvoiceItemDTO(InvoiceItem item) {
        this.id = item.getId();
        this.designation = item.getDesignation();
        this.description = item.getDescription();
        this.quantity = item.getQuantity();
        this.unitPrice = item.getUnitPrice();
        this.total = item.getTotal();
        this.taxRate = item.getTaxRate();
        this.createdAt = item.getCreatedAt();
        this.updatedAt = item.getUpdatedAt();
        
        if (item.getTask() != null) {
            this.taskId = item.getTask().getId();
            this.taskName = item.getTask().getName();
        }
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
    }
    
    public Double getUnitPrice() {
        return unitPrice;
    }
    
    public void setUnitPrice(Double unitPrice) {
        this.unitPrice = unitPrice;
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
    
    public Long getTaskId() {
        return taskId;
    }
    
    public void setTaskId(Long taskId) {
        this.taskId = taskId;
    }
    
    public String getTaskName() {
        return taskName;
    }
    
    public void setTaskName(String taskName) {
        this.taskName = taskName;
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
