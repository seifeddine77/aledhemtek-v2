package com.aledhemtek.services;

import com.aledhemtek.dto.CategoryDto;
import com.aledhemtek.model.Category;
import com.aledhemtek.repositories.CategoryRepository;
import com.aledhemtek.interfaces.CategoryService;
import com.aledhemtek.interfaces.StorageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class CategoryServiceImpl implements CategoryService {

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private StorageService storageService;

    @Override
    public CategoryDto createCategory(CategoryDto categoryDto) {
        String imageName = storageService.store(categoryDto.getFile(), "categories");
        Category category = new Category();
        category.setName(categoryDto.getName());
        category.setDescription(categoryDto.getDescription());
        category.setImg(imageName);
        Category savedCategory = categoryRepository.save(category);
        return toDto(savedCategory);
    }

    @Override
    public List<CategoryDto> getAllCategories() {
        return categoryRepository.findAll().stream().map(this::toDto).collect(Collectors.toList());
    }

    private CategoryDto toDto(Category category) {
        CategoryDto dto = new CategoryDto();
        dto.setId(category.getId());
        dto.setName(category.getName());
        dto.setImg(category.getImg());
        return dto;
    }
}
