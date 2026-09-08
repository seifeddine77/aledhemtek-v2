package com.aledhemtek.security;

import com.aledhemtek.dto.SignupRequest;
import com.aledhemtek.model.Role;
import com.aledhemtek.repositories.ClientRepository;
import com.aledhemtek.repositories.ConsultantRepository;
import com.aledhemtek.repositories.RoleRepository;
import com.aledhemtek.repositories.UserRepository;
import com.aledhemtek.services.AuthService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthSecurityTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private ClientRepository clientRepository;

    @Mock
    private ConsultantRepository consultantRepository;

    @Mock
    private RoleRepository roleRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private AuthService authService;

    private SignupRequest validClientRequest;

    @BeforeEach
    void setUp() {
        validClientRequest = new SignupRequest();
        validClientRequest.setEmail("testclient@example.com");
        validClientRequest.setPassword("securePassword123!");
        validClientRequest.setName("Client Test");
        validClientRequest.setUserRole("CLIENT");
    }

    @Test
    void testAdminRegistrationIsForbidden() {
        SignupRequest adminRequest = new SignupRequest();
        adminRequest.setEmail("hacker@example.com");
        adminRequest.setPassword("pass123");
        adminRequest.setUserRole("ADMIN");

        when(userRepository.existsByEmail("hacker@example.com")).thenReturn(false);

        assertThrows(AccessDeniedException.class, () -> {
            authService.createUser(adminRequest);
        });

        verify(clientRepository, never()).save(any());
        verify(userRepository, never()).save(any());
    }

    @Test
    void testClientRegistrationSucceeds() {
        when(userRepository.existsByEmail("testclient@example.com")).thenReturn(false);
        when(roleRepository.findByName("CLIENT")).thenReturn(Optional.of(new Role("CLIENT")));
        when(passwordEncoder.encode("securePassword123!")).thenReturn("encoded_pass_hash");

        boolean result = authService.createUser(validClientRequest);

        assertTrue(result);
        verify(clientRepository, times(1)).save(any());
    }

    @Test
    void testDuplicateEmailRegistrationFails() {
        when(userRepository.existsByEmail("testclient@example.com")).thenReturn(true);

        boolean result = authService.createUser(validClientRequest);

        assertFalse(result);
        verify(clientRepository, never()).save(any());
    }
}
