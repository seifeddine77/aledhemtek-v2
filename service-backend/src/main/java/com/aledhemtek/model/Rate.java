package com.aledhemtek.model;

import com.aledhemtek.dto.RateDto;
import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Rate {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Double price;
    private LocalDate startDate;
    private LocalDate endDate;
    
    // Référence vers la tâche (pour la relation bidirectionnelle)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "task_id")
    @JsonBackReference
    private Task task;

    public RateDto getRateDto() {
        RateDto dto = new RateDto();
        dto.setId(id);
        dto.setPrice(price);
        dto.setStartDate(startDate);
        dto.setEndDate(endDate);
        return dto;
    }
}
