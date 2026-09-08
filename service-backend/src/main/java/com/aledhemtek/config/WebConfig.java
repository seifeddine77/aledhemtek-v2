package com.aledhemtek.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.lang.NonNull;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.nio.file.Path;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    private final StorageProperties storageProperties;

    public WebConfig(StorageProperties storageProperties) {
        this.storageProperties = storageProperties;
    }

    @Override
    public void addResourceHandlers(@NonNull ResourceHandlerRegistry registry) {
        Path rootUploadDir = storageProperties.getResolvedRootPath();
        String uploadsPath = rootUploadDir.toUri().toString();
        if (!uploadsPath.endsWith("/")) {
            uploadsPath += "/";
        }
        
        registry
                .addResourceHandler("/uploads/resumes/**")
                .addResourceLocations(uploadsPath + "resumes/");

        registry
                .addResourceHandler("/uploads/profile-pictures/**")
                .addResourceLocations(uploadsPath + "profile-pictures/");
                
        // Ajout pour les images de tâches
        registry
                .addResourceHandler("/uploads/tasks/**")
                .addResourceLocations(uploadsPath + "tasks/");
                
        // Ajout pour les images de services
        registry
                .addResourceHandler("/uploads/services/**")
                .addResourceLocations(uploadsPath + "services/");
                
        // Ajout pour les images de catégories
        registry
                .addResourceHandler("/uploads/categories/**")
                .addResourceLocations(uploadsPath + "categories/");
    }

}
