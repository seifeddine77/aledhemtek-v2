package com.aledhemtek.services;

import com.aledhemtek.dto.ConsultantDTO;
import com.aledhemtek.enums.AccountStatus;
import com.aledhemtek.interfaces.ConsultantInterface;
import com.aledhemtek.model.Consultant;
import com.aledhemtek.model.Role;
import com.aledhemtek.repositories.ConsultantRepository;
import com.aledhemtek.repositories.RoleRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class ConsultantServiceImpl implements ConsultantInterface {
    private final ConsultantRepository consultantRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;

    public ConsultantServiceImpl(ConsultantRepository consultantRepository, RoleRepository roleRepository, PasswordEncoder passwordEncoder) {
        this.consultantRepository = consultantRepository;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
    }

    private ConsultantDTO mapToDTO(Consultant c) {
        ConsultantDTO dto = new ConsultantDTO();
        dto.setId(c.getId());
        dto.setEmail(c.getEmail());
        dto.setFirstName(c.getFirstName());
        dto.setLastName(c.getLastName());
        dto.setPhone(c.getPhone());
        dto.setDob(c.getDob());
        dto.setCountry(c.getCountry());
        dto.setCity(c.getCity());
        dto.setZip(c.getZip());
        dto.setAddress(c.getAddress());
        dto.setProfilePic(c.getProfilePic());
        dto.setProfession(c.getProfession());
        dto.setStatus(c.getStatus());
        dto.setExp(c.getExp());
        dto.setCompanyName(c.getCompanyName());
        dto.setResumePath(c.getResumePath());
        return dto;
    }

    private Consultant mapToEntity(ConsultantDTO dto) {
        Consultant consultant = new Consultant();
        consultant.setEmail(dto.getEmail());
        consultant.setFirstName(dto.getFirstName());
        consultant.setLastName(dto.getLastName());
        consultant.setPhone(dto.getPhone());
        consultant.setDob(dto.getDob());
        consultant.setCountry(dto.getCountry());
        consultant.setCity(dto.getCity());
        consultant.setZip(dto.getZip());
        consultant.setAddress(dto.getAddress());
        consultant.setProfession(dto.getProfession());
        consultant.setExp(dto.getExp());
        consultant.setCompanyName(dto.getCompanyName());
        consultant.setStatus(AccountStatus.PENDING);
        return consultant;
    }

    // Register consultant with file upload support
    @Override
    public ResponseEntity<?> createConsultant(ConsultantDTO dto) {
        try {
            ObjectMapper mapper = new ObjectMapper();
            // Logging for debug
            System.out.println("🧾 Saving Consultant DTO: " + mapper.writeValueAsString(dto));
            System.out.println("📎 ProfilePic: " + (dto.getProfilePicFile() != null ? dto.getProfilePicFile().getOriginalFilename() : "null"));
            System.out.println("📎 Resume: " + (dto.getResume() != null ? dto.getResume().getOriginalFilename() : "null"));

            // Check if email already exists
            if (consultantRepository.findByEmail(dto.getEmail()).isPresent()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Email already exists"));
            }

            Consultant consultant = mapToEntity(dto);
            consultant.setPassword(passwordEncoder.encode(dto.getPassword()));

            // Save profile picture if exists
            if (dto.getProfilePicFile() != null && !dto.getProfilePicFile().isEmpty()) {
                MultipartFile profilePic = dto.getProfilePicFile();
                String profileName = UUID.randomUUID() + "_" + profilePic.getOriginalFilename();
                Path profilePath = Paths.get(System.getProperty("user.dir"), "service-backend", "uploads", "profile-pictures");
                Files.createDirectories(profilePath);
                profilePic.transferTo(profilePath.resolve(profileName).toFile());
                consultant.setProfilePic(profileName);
            }

            // Save resume if exists
            if (dto.getResume() != null && !dto.getResume().isEmpty()) {
                MultipartFile resumeFile = dto.getResume();
                String resumeName = UUID.randomUUID() + "_" + resumeFile.getOriginalFilename();
                Path resumePath = Paths.get(System.getProperty("user.dir"), "service-backend", "uploads", "resumes");
                Files.createDirectories(resumePath);
                resumeFile.transferTo(resumePath.resolve(resumeName).toFile());
                consultant.setResumePath(resumeName);
            }

            // Assign "CONSULTANT" role
            Role role = roleRepository.findByName("CONSULTANT")
                    .orElseGet(() -> roleRepository.save(new Role("CONSULTANT")));
            consultant.getRoles().add(role);

            // Save to DB
            consultantRepository.save(consultant);

            System.out.println("✅ Consultant saved successfully");
            return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
                    "message", "Consultant registered successfully. Waiting for admin approval.",
                    "consultant", mapToDTO(consultant)
            ));

        } catch (IOException e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                    "message", "Could not save uploaded file.",
                    "error", e.getMessage()
            ));
        }
    }

    @Override
    public List<ConsultantDTO> getAllConsultants() {
        return consultantRepository.findAll()
                .stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public ConsultantDTO getConsultantById(Long id) {
        Consultant consultant = consultantRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Consultant not found"));
        return mapToDTO(consultant);
    }

    @Override
    public ConsultantDTO approveConsultant(Long id) {
        Consultant consultant = consultantRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Consultant not found"));
        consultant.setStatus(AccountStatus.APPROVED);
        Consultant saved = consultantRepository.save(consultant);
        return mapToDTO(saved);
    }

    @Override
    public ConsultantDTO rejectConsultant(Long id) {
        Consultant consultant = consultantRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Consultant not found"));
        consultant.setStatus(AccountStatus.REJECTED);
        Consultant saved = consultantRepository.save(consultant);
        return mapToDTO(saved);
    }

    @Override
    public ConsultantDTO updateConsultant(Long id, ConsultantDTO dto) {
        Consultant consultant = consultantRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Consultant not found"));
        // Update logic here (copy fields from dto to consultant)
        consultant.setEmail(dto.getEmail());
        consultant.setFirstName(dto.getFirstName());
        consultant.setLastName(dto.getLastName());
        consultant.setPhone(dto.getPhone());
        consultant.setDob(dto.getDob());
        consultant.setCountry(dto.getCountry());
        consultant.setCity(dto.getCity());
        consultant.setZip(dto.getZip());
        consultant.setAddress(dto.getAddress());
        consultant.setProfession(dto.getProfession());
        consultant.setExp(dto.getExp());
        consultant.setCompanyName(dto.getCompanyName());
        return mapToDTO(consultantRepository.save(consultant));
    }

    @Override
    public void deleteConsultant(Long id) {
        consultantRepository.deleteById(id);
    }
}
