package com.aledhemtek.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Configuration
@ConfigurationProperties(prefix = "storage")
public class StorageProperties {

    private String rootDir = "uploads";
    private String serviceDir = "uploads";

    public String getRootDir() {
        return rootDir;
    }

    public void setRootDir(String rootDir) {
        this.rootDir = rootDir;
    }

    public String getServiceDir() {
        return serviceDir;
    }

    public void setServiceDir(String serviceDir) {
        this.serviceDir = serviceDir;
    }

    /**
     * Resolves root uploads directory across Docker, repo root, and service-backend execution paths
     */
    public java.nio.file.Path getResolvedRootPath() {
        java.nio.file.Path direct = java.nio.file.Paths.get(rootDir);
        if (direct.isAbsolute()) {
            return direct.normalize();
        }

        java.nio.file.Path fromUserDir = java.nio.file.Paths.get(System.getProperty("user.dir"), rootDir).normalize();
        if (java.nio.file.Files.exists(fromUserDir)) {
            return fromUserDir;
        }

        java.nio.file.Path fromSubdir = java.nio.file.Paths.get(System.getProperty("user.dir"), "service-backend", rootDir).normalize();
        if (java.nio.file.Files.exists(fromSubdir)) {
            return fromSubdir;
        }

        return fromUserDir;
    }
}
