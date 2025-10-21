package com.aledhemtek.dto;

import com.aledhemtek.model.Reservation;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
public class ReservationDto {
    private Long id;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private String title;
    private String description;
    private Reservation.ReservationStatus status;
    private boolean assigned;
    private Long clientId;
    private String clientName;
    private String clientPhone;
    private Long consultantId;
    private String consultantName;
    private List<TaskDto> tasks;
    private Double totalPrice;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    // Géolocalisation
    private Double latitude;
    private Double longitude;
    private String address;
}
