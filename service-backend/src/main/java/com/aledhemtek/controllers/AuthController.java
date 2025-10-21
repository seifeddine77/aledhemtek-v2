package com.aledhemtek.controllers;

import com.aledhemtek.dto.AuthRequestDTO;
import com.aledhemtek.dto.AuthResponseDTO;
import com.aledhemtek.dto.SignupRequest;
import com.aledhemtek.services.AuthService;
import com.aledhemtek.config.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthService authService;

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private UserDetailsService userDetailsService;

    @Autowired
    private JwtUtil jwtUtil;

    @PostMapping("/signup")
    public ResponseEntity<?> signupUser(@RequestBody SignupRequest signupRequest) {
        boolean isUserCreated = authService.createUser(signupRequest);
        if (isUserCreated) {
            return new ResponseEntity<>("User created successfully", HttpStatus.CREATED);
        }
        return new ResponseEntity<>("User not created, try again later", HttpStatus.BAD_REQUEST);
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody AuthRequestDTO authRequestDTO) {
        try {
            authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(authRequestDTO.getEmail(), authRequestDTO.getPassword())
            );
        } catch (BadCredentialsException e) {
            return new ResponseEntity<>("Incorrect email or password", HttpStatus.UNAUTHORIZED);
        }

        final UserDetails userDetails = userDetailsService.loadUserByUsername(authRequestDTO.getEmail());
        final String jwt = jwtUtil.generateToken(userDetails);
        
        // Get user role from authorities
        String role = userDetails.getAuthorities().isEmpty() ? "USER" : 
                     userDetails.getAuthorities().iterator().next().getAuthority();

        // Get user information
        com.aledhemtek.model.User user = authService.getUserByEmail(authRequestDTO.getEmail());
        
        AuthResponseDTO response = new AuthResponseDTO(jwt, role);
        response.setEmail(authRequestDTO.getEmail());
        response.setUserId(user.getId());
        
        return ResponseEntity.ok(response);
    }
}
