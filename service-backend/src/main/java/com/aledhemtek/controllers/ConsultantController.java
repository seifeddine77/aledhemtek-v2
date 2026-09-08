package com.aledhemtek.controllers;

import com.aledhemtek.config.StorageProperties;
import com.aledhemtek.dto.ConsultantDTO;
import com.aledhemtek.enums.AccountStatus;
import com.aledhemtek.services.ConsultantServiceImpl;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Date;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/consultants")
public class ConsultantController {
    private final ConsultantServiceImpl consultantService;
    private final StorageProperties storageProperties;

    public ConsultantController(ConsultantServiceImpl consultantService, StorageProperties storageProperties) {
        this.consultantService = consultantService;
        this.storageProperties = storageProperties;
    }

    @GetMapping("/get-all")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<ConsultantDTO>> getAll() {
        return ResponseEntity.ok(consultantService.getAllConsultants());
    }

    @GetMapping("/get-consultant/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ConsultantDTO> getById(@PathVariable Long id) {
        return ResponseEntity.ok(consultantService.getConsultantById(id));
    }

    @PutMapping("/approve/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ConsultantDTO> approveConsultant(@PathVariable Long id) {
        return ResponseEntity.ok(consultantService.approveConsultant(id));
    }

    @PutMapping("/reject/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ConsultantDTO> rejectConsultant(@PathVariable Long id) {
        return ResponseEntity.ok(consultantService.rejectConsultant(id));
    }

    @PutMapping("/update/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'CONSULTANT')")
    public ResponseEntity<ConsultantDTO> update(@PathVariable Long id, @RequestBody ConsultantDTO dto) {
        return ResponseEntity.ok(consultantService.updateConsultant(id, dto));
    }

    @DeleteMapping("/delete/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        consultantService.deleteConsultant(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/uploads/resumes/{filename:.+}")
    public ResponseEntity<Resource> getResume(@PathVariable String filename, 
                                            @RequestParam(value = "download", defaultValue = "false") boolean download) {
        try {
            // Nettoyer le nom de fichier contre le path traversal
            if (filename == null || filename.contains("..") || filename.contains("/") || filename.contains("\\")) {
                return ResponseEntity.badRequest().build();
            }

            // Déterminer le dossier de base des CVs
            Path baseDir = storageProperties.getResolvedRootPath().resolve("resumes").toAbsolutePath().normalize();

            Path file = baseDir.resolve(filename).normalize().toAbsolutePath();
            
            // Vérification stricte anti-Path-Traversal
            if (!file.startsWith(baseDir)) {
                System.err.println("[SECURITY] Tentative de Path Traversal détectée pour le fichier: " + filename);
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }

            Resource resource = new UrlResource(file.toUri());

            if (resource.exists() && resource.isReadable()) {
                String contentType = "application/pdf"; // Par défaut PDF pour les CVs
                try {
                    contentType = Files.probeContentType(file);
                    if (contentType == null) contentType = "application/pdf";
                } catch (Exception e) {
                    contentType = "application/pdf"; // fallback
                }
                
                String disposition = download ? "attachment" : "inline";
                
                return ResponseEntity.ok()
                        .contentType(MediaType.parseMediaType(contentType))
                        .header(HttpHeaders.CONTENT_DISPOSITION, disposition + "; filename=\"" + resource.getFilename() + "\"")
                        .body(resource);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (MalformedURLException e) {
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @PostMapping("/create-consultant")
    public ResponseEntity<?> createConsultant(
            @RequestParam("firstName") String firstName,
            @RequestParam("lastName") String lastName,
            @RequestParam("email") String email,
            @RequestParam("password") String password,
            @RequestParam(value = "phone", required = false) String phone,
            @RequestParam(value = "dob", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) Date dob,
            @RequestParam(value = "country", required = false) String country,
            @RequestParam(value = "city", required = false) String city,
            @RequestParam(value = "zip", required = false) String zip,
            @RequestParam(value = "address", required = false) String address,
            @RequestParam(value = "profession", required = false) String profession,
            @RequestParam(value = "exp", required = false) String exp,
            @RequestParam(value = "companyName", required = false) String companyName,
            @RequestParam(value = "profilePic", required = false) MultipartFile profilePic,
            @RequestParam(value = "resume", required = false) MultipartFile resume
    ) {
        try {
            ConsultantDTO dto = new ConsultantDTO();
            dto.setFirstName(firstName);
            dto.setLastName(lastName);
            dto.setEmail(email);
            dto.setPassword(password);
            dto.setPhone(phone);
            dto.setDob(dob);
            dto.setCountry(country);
            dto.setCity(city);
            dto.setZip(zip != null ? Integer.parseInt(zip) : 0);
            dto.setAddress(address);
            dto.setProfession(profession);
            dto.setExp(exp != null ? Integer.parseInt(exp) : 0);
            dto.setCompanyName(companyName);
            dto.setProfilePicFile(profilePic);
            dto.setResume(resume);
            dto.setStatus(AccountStatus.PENDING);

            return consultantService.createConsultant(dto);
        } catch (NumberFormatException e) {
            return ResponseEntity.badRequest().body("Invalid number format for zip or exp.");
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                    "message", "Unexpected error",
                    "error", e.getMessage()
            ));
        }
    }

}
