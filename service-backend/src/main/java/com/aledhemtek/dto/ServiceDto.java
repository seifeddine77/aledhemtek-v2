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

    public ServiceDto() {}

    public ServiceDto(Long id, String name, String description, String img, Long categoryId, String categoryName, List<TaskDto> tasks) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.img = img;
        this.categoryId = categoryId;
        this.categoryName = categoryName;
        this.tasks = tasks;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getImg() { return img; }
    public void setImg(String img) { this.img = img; }

    public Long getCategoryId() { return categoryId; }
    public void setCategoryId(Long categoryId) { this.categoryId = categoryId; }

    public String getCategoryName() { return categoryName; }
    public void setCategoryName(String categoryName) { this.categoryName = categoryName; }

    public List<TaskDto> getTasks() { return tasks; }
    public void setTasks(List<TaskDto> tasks) { this.tasks = tasks; }
}
