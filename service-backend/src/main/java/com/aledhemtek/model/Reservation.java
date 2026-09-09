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

    @Column(name = "building_details", length = 500)
    private String buildingDetails;

    @Column(name = "housing_type", length = 50)
    private String housingType;

    @Column(name = "urgency", length = 30)
    private String urgency;

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
        dto.setBuildingDetails(buildingDetails);
        dto.setHousingType(housingType);
        dto.setUrgency(urgency);
        if (reservationTasks != null) {
            dto.setTasks(reservationTasks.stream().map(rt -> {
                var taskDto = rt.getTask().getTaskDto();
                taskDto.setQuantity(rt.getQuantity());
                return taskDto;
            }).collect(Collectors.toList()));
        }
        return dto;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public LocalDateTime getStartDate() { return startDate; }
    public void setStartDate(LocalDateTime startDate) { this.startDate = startDate; }
    public LocalDateTime getEndDate() { return endDate; }
    public void setEndDate(LocalDateTime endDate) { this.endDate = endDate; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public ReservationStatus getStatus() { return status; }
    public void setStatus(ReservationStatus status) { this.status = status; }
    public boolean isAssigned() { return assigned; }
    public void setAssigned(boolean assigned) { this.assigned = assigned; }
    public Client getClient() { return client; }
    public void setClient(Client client) { this.client = client; }
    public Consultant getConsultant() { return consultant; }
    public void setConsultant(Consultant consultant) { this.consultant = consultant; }
    public List<Task> getTasks() { return tasks; }
    public void setTasks(List<Task> tasks) { this.tasks = tasks; }
    public List<ReservationTask> getReservationTasks() { return reservationTasks; }
    public void setReservationTasks(List<ReservationTask> reservationTasks) { this.reservationTasks = reservationTasks; }
    public Double getTotalPrice() { return totalPrice; }
    public void setTotalPrice(Double totalPrice) { this.totalPrice = totalPrice; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
    public Double getLatitude() { return latitude; }
    public void setLatitude(Double latitude) { this.latitude = latitude; }
    public Double getLongitude() { return longitude; }
    public void setLongitude(Double longitude) { this.longitude = longitude; }
    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }
    public String getBuildingDetails() { return buildingDetails; }
    public void setBuildingDetails(String buildingDetails) { this.buildingDetails = buildingDetails; }
    public String getHousingType() { return housingType; }
    public void setHousingType(String housingType) { this.housingType = housingType; }
    public String getUrgency() { return urgency; }
    public void setUrgency(String urgency) { this.urgency = urgency; }
}
