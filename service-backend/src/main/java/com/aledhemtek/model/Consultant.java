package com.aledhemtek.model;

import com.aledhemtek.dto.ConsultantDTO;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import com.aledhemtek.enums.AccountStatus;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@DiscriminatorValue("CONSULTANT")
public class Consultant extends User {
    private String profession;
    private Integer exp;
    @Column(nullable = true, name = "company_name")
    private String companyName;
    private String resumePath;
    @Enumerated(EnumType.STRING)
    private AccountStatus status = AccountStatus.PENDING;

    @Column(nullable = true, length = 14)
    private String siret;

    @Column(nullable = true)
    private String insuranceProvider;

    @Column(nullable = true)
    private String insurancePolicyNumber;

    @Temporal(TemporalType.DATE)
    @Column(nullable = true)
    private java.util.Date insuranceExpiryDate;

    @Column(nullable = true)
    private Integer interventionRadiusKm = 25;

    @Column(nullable = true, length = 1000)
    private String skills;

    @Column(nullable = true)
    private String insuranceDocPath;

    public ConsultantDTO getDto() {
        ConsultantDTO dto = new ConsultantDTO();
        dto.setId(getId());
        dto.setEmail(getEmail());
        dto.setFirstName(getFirstName());
        dto.setLastName(getLastName());
        dto.setPhone(getPhone());
        dto.setDob(getDob());
        dto.setCountry(getCountry());
        dto.setCity(getCity());
        dto.setZip(getZip());
        dto.setAddress(getAddress());
        dto.setProfilePic(getProfilePic());
        dto.setProfession(getProfession());
        dto.setStatus(getStatus());
        dto.setExp(getExp());
        dto.setCompanyName(getCompanyName());
        dto.setResumePath(getResumePath());
        dto.setSiret(getSiret());
        dto.setInsuranceProvider(getInsuranceProvider());
        dto.setInsurancePolicyNumber(getInsurancePolicyNumber());
        dto.setInsuranceExpiryDate(getInsuranceExpiryDate());
        dto.setInterventionRadiusKm(getInterventionRadiusKm());
        dto.setSkills(getSkills());
        dto.setInsuranceDocPath(getInsuranceDocPath());
        return dto;
    }

    public String getProfession() { return profession; }
    public void setProfession(String profession) { this.profession = profession; }
    public Integer getExp() { return exp; }
    public void setExp(Integer exp) { this.exp = exp; }
    public String getCompanyName() { return companyName; }
    public void setCompanyName(String companyName) { this.companyName = companyName; }
    public String getResumePath() { return resumePath; }
    public void setResumePath(String resumePath) { this.resumePath = resumePath; }
    public AccountStatus getStatus() { return status; }
    public void setStatus(AccountStatus status) { this.status = status; }
    public String getSiret() { return siret; }
    public void setSiret(String siret) { this.siret = siret; }
    public String getInsuranceProvider() { return insuranceProvider; }
    public void setInsuranceProvider(String insuranceProvider) { this.insuranceProvider = insuranceProvider; }
    public String getInsurancePolicyNumber() { return insurancePolicyNumber; }
    public void setInsurancePolicyNumber(String insurancePolicyNumber) { this.insurancePolicyNumber = insurancePolicyNumber; }
    public java.util.Date getInsuranceExpiryDate() { return insuranceExpiryDate; }
    public void setInsuranceExpiryDate(java.util.Date insuranceExpiryDate) { this.insuranceExpiryDate = insuranceExpiryDate; }
    public Integer getInterventionRadiusKm() { return interventionRadiusKm; }
    public void setInterventionRadiusKm(Integer interventionRadiusKm) { this.interventionRadiusKm = interventionRadiusKm; }
    public String getSkills() { return skills; }
    public void setSkills(String skills) { this.skills = skills; }
    public String getInsuranceDocPath() { return insuranceDocPath; }
    public void setInsuranceDocPath(String insuranceDocPath) { this.insuranceDocPath = insuranceDocPath; }
}
