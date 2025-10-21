package com.aledhemtek.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.lang.NonNull;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {
    @Override
    public void addResourceHandlers(@NonNull ResourceHandlerRegistry registry) {
        // Configuration pour Windows - dossier uploads dans service-backend
        String uploadsPath = System.getProperty("user.dir") + "/service-backend/uploads/";
        
        // Debug: afficher le chemin exact
        System.out.println("[WebConfig] Working directory: " + System.getProperty("user.dir"));
        System.out.println("[WebConfig] Uploads path: " + uploadsPath);
        
        // Vérifier si le dossier existe
        java.io.File uploadsDir = new java.io.File(uploadsPath);
        System.out.println("[WebConfig] Uploads directory exists: " + uploadsDir.exists());
        System.out.println("[WebConfig] Uploads directory absolute path: " + uploadsDir.getAbsolutePath());
        
        registry
                .addResourceHandler("/uploads/resumes/**")
                .addResourceLocations("file:" + uploadsPath + "resumes/");

        registry
                .addResourceHandler("/uploads/profile-pictures/**")
                .addResourceLocations("file:" + uploadsPath + "profile-pictures/");
                
        // Ajout pour les images de tâches
        registry
                .addResourceHandler("/uploads/tasks/**")
                .addResourceLocations("file:" + uploadsPath + "tasks/");
                
        // Ajout pour les images de services
        registry
                .addResourceHandler("/uploads/services/**")
                .addResourceLocations("file:" + uploadsPath + "services/");
                
        // Ajout pour les images de catégories
        registry
                .addResourceHandler("/uploads/categories/**")
                .addResourceLocations("file:" + uploadsPath + "categories/");
    }

}
