package com.aledhemtek.controllers;

import com.aledhemtek.dto.EvaluationDto;
import com.aledhemtek.interfaces.EvaluationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import com.aledhemtek.config.CustomUserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/evaluations")
@CrossOrigin(origins = "http://localhost:4200")
public class EvaluationController {
    
    @Autowired
    private EvaluationService evaluationService;

    private boolean isAdmin(Authentication authentication) {
        if (authentication == null) return false;
        return authentication.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN") || a.getAuthority().equals("ADMIN"));
    }

    private Long getAuthenticatedUserId(Authentication authentication) {
        if (authentication != null && authentication.getPrincipal() instanceof CustomUserDetails) {
            return ((CustomUserDetails) authentication.getPrincipal()).getUser().getId();
        }
        return null;
    }
    
    /**
     * Créer une nouvelle évaluation
     */
    @PostMapping
    @PreAuthorize("hasRole('CLIENT')")
    public ResponseEntity<?> createEvaluation(@RequestBody EvaluationDto evaluationDto, Authentication authentication) {
        try {
            Long authUserId = getAuthenticatedUserId(authentication);
            evaluationDto.setClientId(authUserId);
            EvaluationDto createdEvaluation = evaluationService.createEvaluation(evaluationDto);
            return ResponseEntity.status(HttpStatus.CREATED).body(createdEvaluation);
        } catch (IllegalStateException | IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", e.getMessage()));
        }
    }
    
    /**
     * Mettre à jour une évaluation
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('CLIENT') or hasRole('ADMIN')")
    public ResponseEntity<?> updateEvaluation(
            @PathVariable Long id, 
            @RequestBody EvaluationDto evaluationDto,
            Authentication authentication) {
        try {
            EvaluationDto existing = evaluationService.getEvaluationById(id);
            if (existing == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
            }
            if (!isAdmin(authentication)) {
                Long authUserId = getAuthenticatedUserId(authentication);
                if (!existing.getClientId().equals(authUserId)) {
                    return ResponseEntity.status(HttpStatus.FORBIDDEN)
                            .body(Map.of("error", "Access denied - You can only edit your own evaluation"));
                }
            }
            EvaluationDto updatedEvaluation = evaluationService.updateEvaluation(id, evaluationDto);
            return ResponseEntity.ok(updatedEvaluation);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }
    
    /**
     * Récupérer une évaluation par ID
     */
    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('CLIENT') or hasRole('CONSULTANT')")
    public ResponseEntity<EvaluationDto> getEvaluationById(@PathVariable Long id) {
        try {
            EvaluationDto evaluation = evaluationService.getEvaluationById(id);
            return ResponseEntity.ok(evaluation);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }
    
    /**
     * Récupérer une évaluation par ID de réservation
     */
    @GetMapping("/reservation/{reservationId}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('CLIENT') or hasRole('CONSULTANT')")
    public ResponseEntity<EvaluationDto> getEvaluationByReservationId(@PathVariable Long reservationId) {
        try {
            EvaluationDto evaluation = evaluationService.getEvaluationByReservationId(reservationId);
            return ResponseEntity.ok(evaluation);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }
    
    /**
     * Récupérer toutes les évaluations d'un client
     */
    @GetMapping("/client/{clientId}")
    @PreAuthorize("hasRole('ADMIN') or (hasRole('CLIENT') and #clientId == authentication.principal.user.id)")
    public ResponseEntity<List<EvaluationDto>> getEvaluationsByClientId(@PathVariable Long clientId) {
        try {
            List<EvaluationDto> evaluations = evaluationService.getEvaluationsByClientId(clientId);
            return ResponseEntity.ok(evaluations);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }
    
    /**
     * Récupérer toutes les évaluations pour un consultant
     */
    @GetMapping("/consultant/{consultantId}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('CONSULTANT')")
    public ResponseEntity<List<EvaluationDto>> getEvaluationsByConsultantId(@PathVariable Long consultantId) {
        try {
            List<EvaluationDto> evaluations = evaluationService.getEvaluationsByConsultantId(consultantId);
            return ResponseEntity.ok(evaluations);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }
    
    /**
     * Récupérer toutes les évaluations (admin seulement)
     */
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<EvaluationDto>> getAllEvaluations() {
        try {
            List<EvaluationDto> evaluations = evaluationService.getAllEvaluations();
            return ResponseEntity.ok(evaluations);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    /**
     * Supprimer une évaluation
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('CLIENT')")
    public ResponseEntity<?> deleteEvaluation(@PathVariable Long id, Authentication authentication) {
        try {
            EvaluationDto existing = evaluationService.getEvaluationById(id);
            if (existing == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
            }
            if (!isAdmin(authentication)) {
                Long authUserId = getAuthenticatedUserId(authentication);
                if (!existing.getClientId().equals(authUserId)) {
                    return ResponseEntity.status(HttpStatus.FORBIDDEN)
                            .body(Map.of("error", "Access denied - You can only delete your own evaluation"));
                }
            }
            evaluationService.deleteEvaluation(id);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }
    
    /**
     * Vérifier si une réservation a une évaluation
     */
    @GetMapping("/reservation/{reservationId}/exists")
    @PreAuthorize("hasRole('ADMIN') or hasRole('CLIENT') or hasRole('CONSULTANT')")
    public ResponseEntity<Boolean> hasEvaluation(@PathVariable Long reservationId) {
        try {
            boolean hasEvaluation = evaluationService.hasEvaluation(reservationId);
            return ResponseEntity.ok(hasEvaluation);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    /**
     * Récupérer la note moyenne d'un consultant
     */
    @GetMapping("/consultant/{consultantId}/average-rating")
    @PreAuthorize("hasRole('ADMIN') or hasRole('CLIENT') or hasRole('CONSULTANT')")
    public ResponseEntity<Double> getConsultantAverageRating(@PathVariable Long consultantId) {
        try {
            Double averageRating = evaluationService.getConsultantAverageRating(consultantId);
            return ResponseEntity.ok(averageRating);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }
    
    /**
     * Récupérer le nombre d'évaluations d'un consultant
     */
    @GetMapping("/consultant/{consultantId}/count")
    @PreAuthorize("hasRole('ADMIN') or hasRole('CLIENT') or hasRole('CONSULTANT')")
    public ResponseEntity<Long> getConsultantEvaluationCount(@PathVariable Long consultantId) {
        try {
            Long count = evaluationService.getConsultantEvaluationCount(consultantId);
            return ResponseEntity.ok(count);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }
    
    /**
     * Récupérer les évaluations récentes
     */
    @GetMapping("/recent")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<EvaluationDto>> getRecentEvaluations() {
        try {
            List<EvaluationDto> evaluations = evaluationService.getRecentEvaluations();
            return ResponseEntity.ok(evaluations);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    /**
     * Récupérer les meilleures évaluations
     */
    @GetMapping("/top-rated")
    @PreAuthorize("hasRole('ADMIN') or hasRole('CLIENT')")
    public ResponseEntity<List<EvaluationDto>> getTopRatedEvaluations() {
        try {
            List<EvaluationDto> evaluations = evaluationService.getTopRatedEvaluations();
            return ResponseEntity.ok(evaluations);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    /**
     * Récupérer les meilleures évaluations pour la page d'accueil (public)
     */
    @GetMapping("/public/featured")
    public ResponseEntity<List<EvaluationDto>> getFeaturedEvaluationsForHome() {
        try {
            List<EvaluationDto> evaluations = evaluationService.getFeaturedEvaluationsForHome();
            return ResponseEntity.ok(evaluations);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}
