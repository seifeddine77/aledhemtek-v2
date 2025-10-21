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
}
