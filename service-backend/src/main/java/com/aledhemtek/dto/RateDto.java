package com.aledhemtek.dto;

import lombok.Data;

import java.time.LocalDate;

@Data
public class RateDto {
    private Long id;
    private double price;
    private LocalDate startDate;
    private LocalDate endDate;
}
