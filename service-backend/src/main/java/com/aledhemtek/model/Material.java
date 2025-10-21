package com.aledhemtek.model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import com.aledhemtek.dto.MaterialDto;
import lombok.Data;

@Entity
@Data
public class Material {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

    private int quantity;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "task_id", nullable = false)
    @JsonBackReference
    private Task task;

    public MaterialDto getMaterialDto() {
        MaterialDto dto = new MaterialDto();
        dto.setId(id);
        dto.setName(name);
        dto.setQuantity(quantity);
        return dto;
    }
}
