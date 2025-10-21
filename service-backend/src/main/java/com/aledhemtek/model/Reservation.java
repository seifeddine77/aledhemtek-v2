package com.aledhemtek.model;

import com.aledhemtek.dto.ReservationDto;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Reservation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private LocalDateTime startDate;

    @Column(nullable = false)
    private LocalDateTime endDate;

    @Column(nullable = false)
    private String title;

    private String description;

    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private ReservationStatus status = ReservationStatus.PENDING;

    private boolean assigned = false;

    @ManyToOne
    @JoinColumn(name = "client_id", nullable = false)
    private Client client;

    @ManyToOne
    @JoinColumn(name = "consultant_id")
    private Consultant consultant;

    @OneToMany(mappedBy = "reservation", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference
    private List<Task> tasks;

    @OneToMany(mappedBy = "reservation", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference
    private List<ReservationTask> reservationTasks;

    @Column(name = "total_price")
    private Double totalPrice = 0.0;

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at")
    private LocalDateTime updatedAt = LocalDateTime.now();

    // Géolocalisation
    @Column(name = "latitude")
    private Double latitude;

    @Column(name = "longitude")
    private Double longitude;

    @Column(name = "address")
    private String address;

    public enum ReservationStatus {
        PENDING,
        ASSIGNED,
        IN_PROGRESS,
        COMPLETED,
        CANCELLED
    }

    public ReservationDto getReservationDto() {
        ReservationDto dto = new ReservationDto();
        dto.setId(id);
        dto.setStartDate(startDate);
        dto.setEndDate(endDate);
        dto.setTitle(title);
        dto.setDescription(description);
        dto.setStatus(status);
        dto.setAssigned(assigned);
        dto.setClientId(client != null ? client.getId() : null);
        dto.setClientName(client != null ? client.getFirstName() + " " + client.getLastName() : null);
        dto.setClientPhone(client != null ? client.getPhone() : null);
        dto.setConsultantId(consultant != null ? consultant.getId() : null);
        dto.setConsultantName(consultant != null ? consultant.getFirstName() + " " + consultant.getLastName() : null);
        dto.setTotalPrice(totalPrice);
        dto.setCreatedAt(createdAt);
        dto.setUpdatedAt(updatedAt);
        dto.setLatitude(latitude);
        dto.setLongitude(longitude);
        dto.setAddress(address);
        if (reservationTasks != null) {
            dto.setTasks(reservationTasks.stream().map(rt -> {
                var taskDto = rt.getTask().getTaskDto();
                taskDto.setQuantity(rt.getQuantity());
                return taskDto;
            }).collect(Collectors.toList()));
        }
        return dto;
    }
}
