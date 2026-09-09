package com.aledhemtek.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
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

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public Integer getDuration() { return duration; }
    public void setDuration(Integer duration) { this.duration = duration; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public Long getServiceId() { return serviceId; }
    public void setServiceId(Long serviceId) { this.serviceId = serviceId; }
    public String getImageName() { return imageName; }
    public void setImageName(String imageName) { this.imageName = imageName; }
    public List<RateDto> getRates() { return rates; }
    public void setRates(List<RateDto> rates) { this.rates = rates; }
    public List<MaterialDto> getMaterials() { return materials; }
    public void setMaterials(List<MaterialDto> materials) { this.materials = materials; }
    public Double getPrice() { return price; }
    public void setPrice(Double price) { this.price = price; }
    public Integer getQuantity() { return quantity; }
    public void setQuantity(Integer quantity) { this.quantity = quantity; }
}
