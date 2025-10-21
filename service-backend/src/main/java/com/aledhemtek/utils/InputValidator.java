package com.aledhemtek.utils;

import org.springframework.stereotype.Component;
import java.util.regex.Pattern;

/**
 * Utility class for input validation
 */
@Component
public class InputValidator {
    
    private static final Pattern EMAIL_PATTERN = 
        Pattern.compile("^[A-Za-z0-9+_.-]+@(.+)$");
    
    private static final Pattern PHONE_PATTERN = 
        Pattern.compile("^[+]?[0-9]{8,15}$");
    
    private static final Pattern PAYMENT_REFERENCE_PATTERN = 
        Pattern.compile("^[A-Z0-9-]+$");
    
    /**
     * Validate email format
     */
    public boolean isValidEmail(String email) {
        if (email == null || email.trim().isEmpty()) {
            return false;
        }
        return EMAIL_PATTERN.matcher(email).matches();
    }
    
    /**
     * Validate phone number format
     */
    public boolean isValidPhone(String phone) {
        if (phone == null || phone.trim().isEmpty()) {
            return false;
        }
        return PHONE_PATTERN.matcher(phone.replaceAll("\\s", "")).matches();
    }
    
    /**
     * Validate payment amount
     */
    public boolean isValidAmount(Double amount) {
        if (amount == null) {
            return false;
        }
        return amount > 0 && amount <= 1000000; // Max 1 million
    }
    
    /**
     * Validate payment reference
     */
    public boolean isValidPaymentReference(String reference) {
        if (reference == null || reference.trim().isEmpty()) {
            return false;
        }
        return PAYMENT_REFERENCE_PATTERN.matcher(reference).matches();
    }
    
    /**
     * Sanitize string input to prevent XSS
     */
    public String sanitizeInput(String input) {
        if (input == null) {
            return null;
        }
        return input.replaceAll("<", "&lt;")
                   .replaceAll(">", "&gt;")
                   .replaceAll("\"", "&quot;")
                   .replaceAll("'", "&#x27;")
                   .replaceAll("/", "&#x2F;");
    }
    
    /**
     * Validate password strength
     */
    public boolean isStrongPassword(String password) {
        if (password == null || password.length() < 8) {
            return false;
        }
        
        boolean hasUpper = false;
        boolean hasLower = false;
        boolean hasDigit = false;
        boolean hasSpecial = false;
        
        for (char c : password.toCharArray()) {
            if (Character.isUpperCase(c)) hasUpper = true;
            else if (Character.isLowerCase(c)) hasLower = true;
            else if (Character.isDigit(c)) hasDigit = true;
            else if (!Character.isLetterOrDigit(c)) hasSpecial = true;
        }
        
        return hasUpper && hasLower && hasDigit && hasSpecial;
    }
}
