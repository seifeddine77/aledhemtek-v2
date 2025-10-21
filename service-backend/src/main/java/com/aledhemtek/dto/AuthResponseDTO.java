package com.aledhemtek.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class AuthResponseDTO {
    private String token;
    private String role;
    private String email;
    private Long userId;
    
    public AuthResponseDTO(String token, String role) {
        this.token = token;
        this.role = role;
    }
}
