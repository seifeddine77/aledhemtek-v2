package com.aledhemtek.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ResumeParseResponseDto {
    private String firstName;
    private String lastName;
    private String email;
    private String phone;
    private String companyName;
    private String siret;
    private String profession;
    private Integer exp;
    private List<String> skills;
    private List<String> certifications;
    private String insuranceProvider;
    private String insurancePolicyNumber;
    private String insuranceExpiryDate;
    private Integer suggestedRadiusKm;
    private String rawTextSnippet;
    private Double confidenceScore;
    private boolean aiEnhanced;
    private String message;
}
