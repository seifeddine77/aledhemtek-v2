package com.aledhemtek.dto;

import lombok.Data;
import org.springframework.web.multipart.MultipartFile;

@Data
public class CategoryDto {
    private Long id;
    private String name;
    private String description;
    private String img;
    private MultipartFile file;

    public CategoryDto() {}

    public CategoryDto(Long id, String name, String description, String img, MultipartFile file) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.img = img;
        this.file = file;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getImg() { return img; }
    public void setImg(String img) { this.img = img; }

    public MultipartFile getFile() { return file; }
    public void setFile(MultipartFile file) { this.file = file; }
}
