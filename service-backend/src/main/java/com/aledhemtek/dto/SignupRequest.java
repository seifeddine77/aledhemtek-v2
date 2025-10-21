package com.aledhemtek.dto;

import lombok.Data;

@Data
public class SignupRequest {

    private String email;
    private String password;
    private String name;
    private String firstname;
    private String lastname;
    private String phone;
    private String userRole;

}
