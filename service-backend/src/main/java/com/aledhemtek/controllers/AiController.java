package com.aledhemtek.controllers;

import com.aledhemtek.dto.ResumeParseResponseDto;
import com.aledhemtek.services.AiDocumentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
public class AiController {

    private final AiDocumentService aiDocumentService;

    @PostMapping("/parse-resume")
    public ResponseEntity<ResumeParseResponseDto> parseResume(@RequestParam("file") MultipartFile file) {
        ResumeParseResponseDto result = aiDocumentService.parseDocument(file);
        return ResponseEntity.ok(result);
    }

    @PostMapping("/verify-siret")
    public ResponseEntity<Map<String, Object>> verifySiret(@RequestParam(value = "siret", required = false) String siretParam,
                                                          @RequestBody(required = false) Map<String, String> body) {
        String siret = siretParam;
        if ((siret == null || siret.isBlank()) && body != null) {
            siret = body.get("siret");
        }

        if (siret == null || siret.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of(
                    "valid", false,
                    "message", "Numéro SIRET manquant"
            ));
        }

        String cleaned = siret.replaceAll("\\s+", "");
        boolean isValid = aiDocumentService.isValidSiret(cleaned);

        // Format SIRET : 123 456 789 00012
        String formatted = cleaned;
        if (cleaned.length() == 14) {
            formatted = cleaned.substring(0, 3) + " " + cleaned.substring(3, 6) + " " +
                        cleaned.substring(6, 9) + " " + cleaned.substring(9, 14);
        }

        return ResponseEntity.ok(Map.of(
                "siret", cleaned,
                "formatted", formatted,
                "valid", isValid,
                "message", isValid ? "Numéro SIRET valide au Registre National des Entreprises" : "Format ou clé de contrôle SIRET invalide"
        ));
    }
}
