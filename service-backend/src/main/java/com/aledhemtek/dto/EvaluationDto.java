package com.aledhemtek.dto;

import java.time.LocalDateTime;

public class EvaluationDto {
    
    private Long id;
    private Long reservationId;
    private String reservationTitle;
    private Long clientId;
    private String clientName;
    private Integer generalRating;
    private Integer serviceQualityRating;
    private Integer punctualityRating;
    private Integer communicationRating;
    private String comment;
    private Double averageRating;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    // Constructeurs
    public EvaluationDto() {}
    
    public EvaluationDto(Long id, Long reservationId, String reservationTitle, 
                        Long clientId, String clientName, Integer generalRating, 
                        Integer serviceQualityRating, Integer punctualityRating, 
                        Integer communicationRating, String comment, 
                        LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.id = id;
        this.reservationId = reservationId;
        this.reservationTitle = reservationTitle;
        this.clientId = clientId;
        this.clientName = clientName;
        this.generalRating = generalRating;
        this.serviceQualityRating = serviceQualityRating;
        this.punctualityRating = punctualityRating;
        this.communicationRating = communicationRating;
        this.comment = comment;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.averageRating = (generalRating + serviceQualityRating + punctualityRating + communicationRating) / 4.0;
    }
    
    // Getters et Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public Long getReservationId() {
        return reservationId;
    }
    
    public void setReservationId(Long reservationId) {
        this.reservationId = reservationId;
    }
    
    public String getReservationTitle() {
        return reservationTitle;
    }
    
    public void setReservationTitle(String reservationTitle) {
        this.reservationTitle = reservationTitle;
    }
    
    public Long getClientId() {
        return clientId;
    }
    
    public void setClientId(Long clientId) {
        this.clientId = clientId;
    }
    
    public String getClientName() {
        return clientName;
    }
    
    public void setClientName(String clientName) {
        this.clientName = clientName;
    }
    
    public Integer getGeneralRating() {
        return generalRating;
    }
    
    public void setGeneralRating(Integer generalRating) {
        this.generalRating = generalRating;
        updateAverageRating();
    }
    
    public Integer getServiceQualityRating() {
        return serviceQualityRating;
    }
    
    public void setServiceQualityRating(Integer serviceQualityRating) {
        this.serviceQualityRating = serviceQualityRating;
        updateAverageRating();
    }
    
    public Integer getPunctualityRating() {
        return punctualityRating;
    }
    
    public void setPunctualityRating(Integer punctualityRating) {
        this.punctualityRating = punctualityRating;
        updateAverageRating();
    }
    
    public Integer getCommunicationRating() {
        return communicationRating;
    }
    
    public void setCommunicationRating(Integer communicationRating) {
        this.communicationRating = communicationRating;
        updateAverageRating();
    }
    
    public String getComment() {
        return comment;
    }
    
    public void setComment(String comment) {
        this.comment = comment;
    }
    
    public Double getAverageRating() {
        return averageRating;
    }
    
    public void setAverageRating(Double averageRating) {
        this.averageRating = averageRating;
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
    
    private void updateAverageRating() {
        if (generalRating != null && serviceQualityRating != null && 
            punctualityRating != null && communicationRating != null) {
            this.averageRating = (generalRating + serviceQualityRating + punctualityRating + communicationRating) / 4.0;
        }
    }
}
