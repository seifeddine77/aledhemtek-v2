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

    public SignupRequest() {}

    public SignupRequest(String email, String password, String name, String firstname, String lastname, String phone, String userRole) {
        this.email = email;
        this.password = password;
        this.name = name;
        this.firstname = firstname;
        this.lastname = lastname;
        this.phone = phone;
        this.userRole = userRole;
    }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getFirstname() { return firstname; }
    public void setFirstname(String firstname) { this.firstname = firstname; }

    public String getLastname() { return lastname; }
    public void setLastname(String lastname) { this.lastname = lastname; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getUserRole() { return userRole; }
    public void setUserRole(String userRole) { this.userRole = userRole; }
}
