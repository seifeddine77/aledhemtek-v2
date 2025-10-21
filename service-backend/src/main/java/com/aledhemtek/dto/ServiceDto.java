package com.aledhemtek.dto;

import lombok.Data;

import java.util.List;

@Data
public class ServiceDto {
    private Long id;
    private String name;
    private String description;
    private String img;
    private Long categoryId;
    private String categoryName;
    private List<TaskDto> tasks;
}
