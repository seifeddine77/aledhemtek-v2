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
}
