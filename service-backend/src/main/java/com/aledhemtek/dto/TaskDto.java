package com.aledhemtek.dto;

import lombok.Data;

import java.util.List;

@Data
public class TaskDto {
    private Long id;
    private String name;
    private Integer duration;
    private String description;
    private Long serviceId;
    private String imageName;
    private List<RateDto> rates;
    private List<MaterialDto> materials;
    private Double price;
    private Integer quantity; // Quantité pour les réservations
}
