package com.aledhemtek.services;

import com.aledhemtek.interfaces.StorageService;
import com.aledhemtek.config.StorageProperties;
import jakarta.annotation.PostConstruct;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

@Service
public class StorageServiceImpl implements StorageService {

    private final StorageProperties storageProperties;
    private Path serviceRootLocation;

    public StorageServiceImpl(StorageProperties storageProperties) {
        this.storageProperties = storageProperties;
    }

    @Override
    @PostConstruct
    public void init() {
        try {
            // Initialiser le répertoire racine pour les services, tâches, catégories
            serviceRootLocation = Paths.get(storageProperties.getServiceDir()).toAbsolutePath().normalize();
            Files.createDirectories(serviceRootLocation);
        } catch (IOException e) {
            throw new RuntimeException("Could not initialize storage location for services", e);
        }
    }

    @Override
    public String store(MultipartFile file, String entityType) {
        try {
            if (file.isEmpty()) {
                throw new RuntimeException("Failed to store empty file.");
            }

            // Utiliser le répertoire de service dédié pour les catégories, services et tâches
            Path entityPath = this.serviceRootLocation.resolve(entityType).normalize();

            try {
                Files.createDirectories(entityPath);
            } catch (IOException e) {
                throw new RuntimeException("Could not create directory for entity: " + entityType, e);
            }

            String originalFilename = file.getOriginalFilename();
            if (originalFilename == null || originalFilename.trim().isEmpty()) {
                throw new RuntimeException("Failed to store file: original filename is null or empty.");
            }

            // Nettoyer le chemin pour la sécurité (Path Traversal)
            originalFilename = StringUtils.cleanPath(Paths.get(originalFilename).getFileName().toString());

            String extension = "";
            if (originalFilename.contains(".")) {
                extension = originalFilename.substring(originalFilename.lastIndexOf("."));
            }
            String newFileName = UUID.randomUUID().toString() + extension;

            Path destinationFile = entityPath.resolve(Paths.get(newFileName)).normalize().toAbsolutePath();

            // Normaliser également le chemin de l'entité pour une comparaison fiable
            if (!destinationFile.toAbsolutePath().normalize().startsWith(entityPath.toAbsolutePath().normalize())) {
                throw new RuntimeException("Security check failed: Cannot store file outside designated directory.");
            }

            try (InputStream inputStream = file.getInputStream()) {
                Files.copy(inputStream, destinationFile, StandardCopyOption.REPLACE_EXISTING);
            }

            return newFileName;
        } catch (IOException e) {
            throw new RuntimeException("Failed to store file.", e);
        }
    }


}
