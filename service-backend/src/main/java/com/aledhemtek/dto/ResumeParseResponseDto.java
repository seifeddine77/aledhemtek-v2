package com.aledhemtek.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
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

    public ResumeParseResponseDto() {}

    public ResumeParseResponseDto(String firstName, String lastName, String email, String phone, String companyName,
                                  String siret, String profession, Integer exp, List<String> skills,
                                  List<String> certifications, String insuranceProvider, String insurancePolicyNumber,
                                  String insuranceExpiryDate, Integer suggestedRadiusKm, String rawTextSnippet,
                                  Double confidenceScore, boolean aiEnhanced, String message) {
        this.firstName = firstName;
        this.lastName = lastName;
        this.email = email;
        this.phone = phone;
        this.companyName = companyName;
        this.siret = siret;
        this.profession = profession;
        this.exp = exp;
        this.skills = skills;
        this.certifications = certifications;
        this.insuranceProvider = insuranceProvider;
        this.insurancePolicyNumber = insurancePolicyNumber;
        this.insuranceExpiryDate = insuranceExpiryDate;
        this.suggestedRadiusKm = suggestedRadiusKm;
        this.rawTextSnippet = rawTextSnippet;
        this.confidenceScore = confidenceScore;
        this.aiEnhanced = aiEnhanced;
        this.message = message;
    }

    public static ResumeParseResponseDtoBuilder builder() {
        return new ResumeParseResponseDtoBuilder();
    }

    public static class ResumeParseResponseDtoBuilder {
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

        public ResumeParseResponseDtoBuilder firstName(String firstName) { this.firstName = firstName; return this; }
        public ResumeParseResponseDtoBuilder lastName(String lastName) { this.lastName = lastName; return this; }
        public ResumeParseResponseDtoBuilder email(String email) { this.email = email; return this; }
        public ResumeParseResponseDtoBuilder phone(String phone) { this.phone = phone; return this; }
        public ResumeParseResponseDtoBuilder companyName(String companyName) { this.companyName = companyName; return this; }
        public ResumeParseResponseDtoBuilder siret(String siret) { this.siret = siret; return this; }
        public ResumeParseResponseDtoBuilder profession(String profession) { this.profession = profession; return this; }
        public ResumeParseResponseDtoBuilder exp(Integer exp) { this.exp = exp; return this; }
        public ResumeParseResponseDtoBuilder skills(List<String> skills) { this.skills = skills; return this; }
        public ResumeParseResponseDtoBuilder certifications(List<String> certifications) { this.certifications = certifications; return this; }
        public ResumeParseResponseDtoBuilder insuranceProvider(String insuranceProvider) { this.insuranceProvider = insuranceProvider; return this; }
        public ResumeParseResponseDtoBuilder insurancePolicyNumber(String insurancePolicyNumber) { this.insurancePolicyNumber = insurancePolicyNumber; return this; }
        public ResumeParseResponseDtoBuilder insuranceExpiryDate(String insuranceExpiryDate) { this.insuranceExpiryDate = insuranceExpiryDate; return this; }
        public ResumeParseResponseDtoBuilder suggestedRadiusKm(Integer suggestedRadiusKm) { this.suggestedRadiusKm = suggestedRadiusKm; return this; }
        public ResumeParseResponseDtoBuilder rawTextSnippet(String rawTextSnippet) { this.rawTextSnippet = rawTextSnippet; return this; }
        public ResumeParseResponseDtoBuilder confidenceScore(Double confidenceScore) { this.confidenceScore = confidenceScore; return this; }
        public ResumeParseResponseDtoBuilder aiEnhanced(boolean aiEnhanced) { this.aiEnhanced = aiEnhanced; return this; }
        public ResumeParseResponseDtoBuilder message(String message) { this.message = message; return this; }

        public ResumeParseResponseDto build() {
            return new ResumeParseResponseDto(firstName, lastName, email, phone, companyName, siret, profession, exp, skills, certifications, insuranceProvider, insurancePolicyNumber, insuranceExpiryDate, suggestedRadiusKm, rawTextSnippet, confidenceScore, aiEnhanced, message);
        }
    }

    public String getFirstName() { return firstName; }
    public void setFirstName(String firstName) { this.firstName = firstName; }

    public String getLastName() { return lastName; }
    public void setLastName(String lastName) { this.lastName = lastName; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getCompanyName() { return companyName; }
    public void setCompanyName(String companyName) { this.companyName = companyName; }

    public String getSiret() { return siret; }
    public void setSiret(String siret) { this.siret = siret; }

    public String getProfession() { return profession; }
    public void setProfession(String profession) { this.profession = profession; }

    public Integer getExp() { return exp; }
    public void setExp(Integer exp) { this.exp = exp; }

    public List<String> getSkills() { return skills; }
    public void setSkills(List<String> skills) { this.skills = skills; }

    public List<String> getCertifications() { return certifications; }
    public void setCertifications(List<String> certifications) { this.certifications = certifications; }

    public String getInsuranceProvider() { return insuranceProvider; }
    public void setInsuranceProvider(String insuranceProvider) { this.insuranceProvider = insuranceProvider; }

    public String getInsurancePolicyNumber() { return insurancePolicyNumber; }
    public void setInsurancePolicyNumber(String insurancePolicyNumber) { this.insurancePolicyNumber = insurancePolicyNumber; }

    public String getInsuranceExpiryDate() { return insuranceExpiryDate; }
    public void setInsuranceExpiryDate(String insuranceExpiryDate) { this.insuranceExpiryDate = insuranceExpiryDate; }

    public Integer getSuggestedRadiusKm() { return suggestedRadiusKm; }
    public void setSuggestedRadiusKm(Integer suggestedRadiusKm) { this.suggestedRadiusKm = suggestedRadiusKm; }

    public String getRawTextSnippet() { return rawTextSnippet; }
    public void setRawTextSnippet(String rawTextSnippet) { this.rawTextSnippet = rawTextSnippet; }

    public Double getConfidenceScore() { return confidenceScore; }
    public void setConfidenceScore(Double confidenceScore) { this.confidenceScore = confidenceScore; }

    public boolean isAiEnhanced() { return aiEnhanced; }
    public void setAiEnhanced(boolean aiEnhanced) { this.aiEnhanced = aiEnhanced; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
}
