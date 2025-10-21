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

    private String profilePic;    // stored filename
    private String resumePath;    // stored filename
    @JsonIgnore
    private transient MultipartFile profilePicFile; // for upload only
    @JsonIgnore
    private transient MultipartFile resume;         // for upload only
}


