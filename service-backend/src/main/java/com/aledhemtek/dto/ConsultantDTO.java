package com.aledhemtek.dto;

import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.web.multipart.MultipartFile;
import com.aledhemtek.enums.AccountStatus;

import java.util.Date;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ConsultantDTO {
    private Long id;
    private String email;
    private String firstName;
    private String lastName;
    private String phone;
    private Date dob;
    private String country;
    private String city;
    private Integer zip;
    private String address;
    private String profession;
    private AccountStatus status;
    private Integer exp;
    private String companyName;
    private String password;

    private String siret;
    private String insuranceProvider;
    private String insurancePolicyNumber;
    private Date insuranceExpiryDate;
    private Integer interventionRadiusKm = 25;
    private String skills;
    private String insuranceDocPath;

    private String profilePic;    // stored filename
    private String resumePath;    // stored filename
    @JsonIgnore
    private transient MultipartFile profilePicFile; // for upload only
    @JsonIgnore
    private transient MultipartFile resume;         // for upload only
    @JsonIgnore
    private transient MultipartFile insuranceDocFile; // for upload only

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getFirstName() { return firstName; }
    public void setFirstName(String firstName) { this.firstName = firstName; }
    public String getLastName() { return lastName; }
    public void setLastName(String lastName) { this.lastName = lastName; }
    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }
    public Date getDob() { return dob; }
    public void setDob(Date dob) { this.dob = dob; }
    public String getCountry() { return country; }
    public void setCountry(String country) { this.country = country; }
    public String getCity() { return city; }
    public void setCity(String city) { this.city = city; }
    public Integer getZip() { return zip; }
    public void setZip(Integer zip) { this.zip = zip; }
    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }
    public String getProfession() { return profession; }
    public void setProfession(String profession) { this.profession = profession; }
    public AccountStatus getStatus() { return status; }
    public void setStatus(AccountStatus status) { this.status = status; }
    public Integer getExp() { return exp; }
    public void setExp(Integer exp) { this.exp = exp; }
    public String getCompanyName() { return companyName; }
    public void setCompanyName(String companyName) { this.companyName = companyName; }
    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
    public String getSiret() { return siret; }
    public void setSiret(String siret) { this.siret = siret; }
    public String getInsuranceProvider() { return insuranceProvider; }
    public void setInsuranceProvider(String insuranceProvider) { this.insuranceProvider = insuranceProvider; }
    public String getInsurancePolicyNumber() { return insurancePolicyNumber; }
    public void setInsurancePolicyNumber(String insurancePolicyNumber) { this.insurancePolicyNumber = insurancePolicyNumber; }
    public Date getInsuranceExpiryDate() { return insuranceExpiryDate; }
    public void setInsuranceExpiryDate(Date insuranceExpiryDate) { this.insuranceExpiryDate = insuranceExpiryDate; }
    public Integer getInterventionRadiusKm() { return interventionRadiusKm; }
    public void setInterventionRadiusKm(Integer interventionRadiusKm) { this.interventionRadiusKm = interventionRadiusKm; }
    public String getSkills() { return skills; }
    public void setSkills(String skills) { this.skills = skills; }
    public String getInsuranceDocPath() { return insuranceDocPath; }
    public void setInsuranceDocPath(String insuranceDocPath) { this.insuranceDocPath = insuranceDocPath; }
    public String getProfilePic() { return profilePic; }
    public void setProfilePic(String profilePic) { this.profilePic = profilePic; }
    public String getResumePath() { return resumePath; }
    public void setResumePath(String resumePath) { this.resumePath = resumePath; }
    public MultipartFile getProfilePicFile() { return profilePicFile; }
    public void setProfilePicFile(MultipartFile profilePicFile) { this.profilePicFile = profilePicFile; }
    public MultipartFile getResume() { return resume; }
    public void setResume(MultipartFile resume) { this.resume = resume; }
    public MultipartFile getInsuranceDocFile() { return insuranceDocFile; }
    public void setInsuranceDocFile(MultipartFile insuranceDocFile) { this.insuranceDocFile = insuranceDocFile; }
}


