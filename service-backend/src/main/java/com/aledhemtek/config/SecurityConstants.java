package com.aledhemtek.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

/**
 * Security constants configuration
 * All sensitive data should come from environment variables
 */
@Configuration
public class SecurityConstants {
    
    // JWT Configuration
    @Value("${jwt.secret:#{null}}")
    private String jwtSecret;
    
    @Value("${jwt.expiration:86400000}") // 24 hours default
    private Long jwtExpiration;
    
    // Password Policy
    public static final int MIN_PASSWORD_LENGTH = 8;
    public static final int MAX_PASSWORD_LENGTH = 128;
    public static final int MAX_LOGIN_ATTEMPTS = 5;
    public static final int ACCOUNT_LOCK_DURATION_MINUTES = 30;
    
    // Session Configuration
    public static final int SESSION_TIMEOUT_MINUTES = 60;
    public static final boolean SECURE_COOKIE = true;
    public static final boolean HTTP_ONLY_COOKIE = true;
    
    // Rate Limiting
    public static final int MAX_REQUESTS_PER_MINUTE = 100;
    public static final int MAX_FAILED_LOGINS_PER_HOUR = 10;
    
    // File Upload Limits
    public static final long MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
    public static final String[] ALLOWED_FILE_EXTENSIONS = {
        ".jpg", ".jpeg", ".png", ".gif", ".pdf", ".doc", ".docx"
    };
    
    // CORS Configuration
    public static final String[] ALLOWED_ORIGINS = {
        "http://localhost:4200",
        "http://localhost:8080"
    };
    
    public static final String[] ALLOWED_METHODS = {
        "GET", "POST", "PUT", "DELETE", "OPTIONS"
    };
    
    public static final long CORS_MAX_AGE = 3600;
    
    // API Rate Limits
    public static final String RATE_LIMIT_HEADER = "X-RateLimit-Limit";
    public static final String RATE_LIMIT_REMAINING_HEADER = "X-RateLimit-Remaining";
    public static final String RATE_LIMIT_RESET_HEADER = "X-RateLimit-Reset";
    
    // Security Headers
    public static final String CONTENT_SECURITY_POLICY = 
        "default-src 'self'; " +
        "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://apis.google.com; " +
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
        "font-src 'self' https://fonts.gstatic.com; " +
        "img-src 'self' data: https:; " +
        "connect-src 'self' http://localhost:* ws://localhost:*";
    
    public static final String X_FRAME_OPTIONS = "DENY";
    public static final String X_CONTENT_TYPE_OPTIONS = "nosniff";
    public static final String X_XSS_PROTECTION = "1; mode=block";
    
    // Getters
    public String getJwtSecret() {
        if (jwtSecret == null || jwtSecret.isEmpty()) {
            throw new IllegalStateException("JWT secret is not configured. Please set JWT_SECRET environment variable.");
        }
        return jwtSecret;
    }
    
    public Long getJwtExpiration() {
        return jwtExpiration;
    }
}
