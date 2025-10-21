package com.aledhemtek.controllers;

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

    public ConsultantController(ConsultantServiceImpl consultantService) {
        this.consultantService = consultantService;
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
            // Chemin corrigé pour pointer vers le bon dossier uploads
            Path file = Paths.get(System.getProperty("user.dir"), "service-backend", "uploads", "resumes").resolve(filename).normalize();
            
            // Debug: afficher le chemin exact
            System.out.println("[ConsultantController] Tentative d'accès au fichier: " + file.toAbsolutePath());
            System.out.println("[ConsultantController] Le fichier existe: " + Files.exists(file));
            
            Resource resource = new UrlResource(file.toUri());

            if (resource.exists() && resource.isReadable()) {
                String contentType = "application/pdf"; // Par défaut PDF pour les CVs
                try {
                    contentType = Files.probeContentType(file);
                    if (contentType == null) contentType = "application/pdf";
                } catch (Exception e) {
                    contentType = "application/pdf"; // fallback
                }
                
                System.out.println("[ConsultantController] Fichier trouvé et accessible, content-type: " + contentType);
                System.out.println("[ConsultantController] Mode download: " + download);
                
                // Déterminer le Content-Disposition selon le mode
                String disposition = download ? "attachment" : "inline";
                
                return ResponseEntity.ok()
                        .contentType(MediaType.parseMediaType(contentType))
                        .header(HttpHeaders.CONTENT_DISPOSITION, disposition + "; filename=\"" + resource.getFilename() + "\"")
                        .header(HttpHeaders.ACCESS_CONTROL_ALLOW_ORIGIN, "*")
                        .body(resource);
            } else {
                System.out.println("[ConsultantController] Fichier non trouvé ou non accessible");
                return ResponseEntity.notFound().build();
            }
        } catch (MalformedURLException e) {
            System.out.println("[ConsultantController] Erreur MalformedURLException: " + e.getMessage());
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            System.out.println("[ConsultantController] Erreur générale: " + e.getMessage());
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
