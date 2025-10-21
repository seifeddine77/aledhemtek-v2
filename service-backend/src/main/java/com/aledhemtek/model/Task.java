package com.aledhemtek.model;

import com.aledhemtek.dto.TaskDto;
import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Task {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

    private Integer duration;

    private String description;

    private String imageName;

    @ManyToOne
    @JoinColumn(name = "reservation_id")
    @JsonBackReference
    private Reservation reservation;

    @ManyToOne
    @JoinColumn(name = "consultant_id")
    private Consultant consultant;

    @ManyToOne
    @JoinColumn(name = "service_id")
    private Service service;

    @OneToMany(mappedBy = "task", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference
    private List<Rate> rates = new ArrayList<>();

    @OneToMany(mappedBy = "task", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference
    private List<Material> materials = new ArrayList<>();

    public TaskDto getTaskDto() {
        TaskDto taskDto = new TaskDto();
        taskDto.setId(id);
        taskDto.setName(name);
        taskDto.setDescription(description);
        taskDto.setDuration(duration);
        taskDto.setImageName(imageName);
        if (service != null) {
            taskDto.setServiceId(service.getId());
        }
        if (rates != null) {
            taskDto.setRates(rates.stream().map(Rate::getRateDto).collect(Collectors.toList()));
        }
        if (materials != null) {
            taskDto.setMaterials(materials.stream().map(Material::getMaterialDto).collect(Collectors.toList()));
        }
        return taskDto;
    }
    
    /**
     * Calculate total price from rates
     */
    public Double getPrice() {
        if (rates == null || rates.isEmpty()) {
            return 0.0;
        }
        return rates.stream()
                .mapToDouble(rate -> rate.getPrice() != null ? rate.getPrice() : 0.0)
                .sum();
    }
}
