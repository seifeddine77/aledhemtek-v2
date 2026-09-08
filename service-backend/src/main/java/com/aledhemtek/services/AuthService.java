package com.aledhemtek.services;

import com.aledhemtek.dto.SignupRequest;

import com.aledhemtek.model.Client;
import com.aledhemtek.model.Consultant;
import com.aledhemtek.model.Role;
import com.aledhemtek.repositories.ClientRepository;
import com.aledhemtek.repositories.ConsultantRepository;
import com.aledhemtek.repositories.UserRepository;
import com.aledhemtek.repositories.RoleRepository;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import java.util.Collections;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final ClientRepository clientRepository;
    private final ConsultantRepository consultantRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;

    public AuthService(UserRepository userRepository,
                       ClientRepository clientRepository,
                       ConsultantRepository consultantRepository,
                       RoleRepository roleRepository,
                       PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.clientRepository = clientRepository;
        this.consultantRepository = consultantRepository;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
    }

    // Admin account creation is handled by AledhemtekApplication.run()
    // @PostConstruct removed to avoid initialization order conflicts

    public boolean createUser(SignupRequest signupRequest) {
        if (userRepository.existsByEmail(signupRequest.getEmail())) {
            return false;
        }
        if (signupRequest.getUserRole() == null) {
            throw new IllegalArgumentException("User role is required");
        }
        String roleName = signupRequest.getUserRole().trim().toUpperCase();
        if ("ADMIN".equals(roleName)) {
            throw new org.springframework.security.access.AccessDeniedException("Public registration of ADMIN role is forbidden");
        }
        Role userRole = roleRepository.findByName(roleName).orElse(null);
        if (userRole == null) {
            throw new RuntimeException(roleName + " role not found. Please seed roles in the database.");
        }

        switch (roleName) {
            case "CLIENT":
                Client client = new Client();
                client.setEmail(signupRequest.getEmail());
                client.setPassword(passwordEncoder.encode(signupRequest.getPassword()));
                client.setFirstName(signupRequest.getFirstname());
                client.setLastName(signupRequest.getLastname());
                client.setPhone(signupRequest.getPhone());
                client.setRoles(Collections.singletonList(userRole));
                clientRepository.save(client);
                return true;
            case "CONSULTANT":
                Consultant consultant = new Consultant();
                consultant.setEmail(signupRequest.getEmail());
                consultant.setPassword(passwordEncoder.encode(signupRequest.getPassword()));
                consultant.setFirstName(signupRequest.getFirstname());
                consultant.setLastName(signupRequest.getLastname());
                consultant.setPhone(signupRequest.getPhone());
                consultant.setRoles(Collections.singletonList(userRole));
                consultantRepository.save(consultant);
                return true;
            default:
                throw new IllegalArgumentException("Invalid user role: " + signupRequest.getUserRole());
        }
    }
    
    public com.aledhemtek.model.User getUserByEmail(String email) {
        return userRepository.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("User not found with email: " + email));
    }
}
