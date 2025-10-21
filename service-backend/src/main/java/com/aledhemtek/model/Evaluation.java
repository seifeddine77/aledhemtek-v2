package com.aledhemtek.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "evaluations")
public class Evaluation {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @OneToOne
    @JoinColumn(name = "reservation_id", nullable = false, unique = true)
    private Reservation reservation;
    
    @ManyToOne
    @JoinColumn(name = "client_id", nullable = false)
    private User client;
    
    @Column(name = "general_rating", nullable = false)
    private Integer generalRating; // 1-5 étoiles
    
    @Column(name = "service_quality_rating", nullable = false)
    private Integer serviceQualityRating; // 1-5 étoiles
    
    @Column(name = "punctuality_rating", nullable = false)
    private Integer punctualityRating; // 1-5 étoiles
    
    @Column(name = "communication_rating", nullable = false)
    private Integer communicationRating; // 1-5 étoiles
    
    @Column(name = "comment", columnDefinition = "TEXT")
    private String comment;
    
    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    // Constructeurs
    public Evaluation() {
        this.createdAt = LocalDateTime.now();
    }
    
    public Evaluation(Reservation reservation, User client, Integer generalRating, 
                     Integer serviceQualityRating, Integer punctualityRating, 
                     Integer communicationRating, String comment) {
        this();
        this.reservation = reservation;
        this.client = client;
        this.generalRating = generalRating;
        this.serviceQualityRating = serviceQualityRating;
        this.punctualityRating = punctualityRating;
        this.communicationRating = communicationRating;
        this.comment = comment;
    }
    
    // Getters et Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public Reservation getReservation() {
        return reservation;
    }
    
    public void setReservation(Reservation reservation) {
        this.reservation = reservation;
    }
    
    public User getClient() {
        return client;
    }
    
    public void setClient(User client) {
        this.client = client;
    }
    
    public Integer getGeneralRating() {
        return generalRating;
    }
    
    public void setGeneralRating(Integer generalRating) {
        this.generalRating = generalRating;
    }
    
    public Integer getServiceQualityRating() {
        return serviceQualityRating;
    }
    
    public void setServiceQualityRating(Integer serviceQualityRating) {
        this.serviceQualityRating = serviceQualityRating;
    }
    
    public Integer getPunctualityRating() {
        return punctualityRating;
    }
    
    public void setPunctualityRating(Integer punctualityRating) {
        this.punctualityRating = punctualityRating;
    }
    
    public Integer getCommunicationRating() {
        return communicationRating;
    }
    
    public void setCommunicationRating(Integer communicationRating) {
        this.communicationRating = communicationRating;
    }
    
    public String getComment() {
        return comment;
    }
    
    public void setComment(String comment) {
        this.comment = comment;
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
    
    // Méthode pour calculer la note moyenne
    public Double getAverageRating() {
        return (generalRating + serviceQualityRating + punctualityRating + communicationRating) / 4.0;
    }
    
    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
