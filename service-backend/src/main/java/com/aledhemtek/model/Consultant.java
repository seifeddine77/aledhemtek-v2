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
        return dto;
    }
}
