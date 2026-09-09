package com.aledhemtek.controllers;

import com.aledhemtek.config.CustomUserDetails;
import com.aledhemtek.dto.TaskDto;
import com.aledhemtek.dto.TaskManagementRequest;
import com.aledhemtek.interfaces.ReservationTaskService;
import com.aledhemtek.model.Reservation;
import com.aledhemtek.repositories.ReservationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/reservations/{reservationId}/tasks")
@CrossOrigin(origins = "http://localhost:4200")
public class ReservationTaskController {

    @Autowired
    private ReservationTaskService reservationTaskService;

    @Autowired
    private ReservationRepository reservationRepository;

    /**
     * Vérifie les droits d'accès à la réservation pour prévenir les failles IDOR.
     * @return null si l'accès est autorisé, ou un ResponseEntity d'erreur approprié (401, 403, 404).
     */
    private ResponseEntity<?> checkReservationAccess(Long reservationId, Authentication authentication, boolean allowConsultant) {
        if (authentication == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Authentification requise"));
        }

        boolean isAdmin = authentication.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
        if (isAdmin) {
            return null; // Admin a accès à tout
        }

        Long currentUserId = null;
        if (authentication.getPrincipal() instanceof CustomUserDetails) {
            currentUserId = ((CustomUserDetails) authentication.getPrincipal()).getUser().getId();
        }
        if (currentUserId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Utilisateur non identifié"));
        }

        Optional<Reservation> resOpt = reservationRepository.findById(reservationId);
        if (resOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "Réservation introuvable"));
        }
        Reservation res = resOpt.get();

        boolean isClient = res.getClient() != null && res.getClient().getId().equals(currentUserId);
        if (isClient) {
            return null;
        }

        if (allowConsultant && res.getConsultant() != null && res.getConsultant().getId().equals(currentUserId)) {
            return null;
        }

        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", "Accès non autorisé à cette réservation"));
    }

    /**
     * Ajouter une tâche à une réservation
     */
    @PostMapping
    @PreAuthorize("hasRole('CLIENT') or hasRole('ADMIN')")
    public ResponseEntity<?> addTaskToReservation(
            @PathVariable Long reservationId,
            @RequestBody TaskDto taskDto,
            Authentication authentication) {
        ResponseEntity<?> accessError = checkReservationAccess(reservationId, authentication, false);
        if (accessError != null) return accessError;

        try {
            TaskDto addedTask = reservationTaskService.addTaskToReservation(reservationId, taskDto);
            return ResponseEntity.status(HttpStatus.CREATED).body(addedTask);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Ajouter plusieurs tâches à une réservation
     */
    @PostMapping("/batch")
    @PreAuthorize("hasRole('CLIENT') or hasRole('ADMIN')")
    public ResponseEntity<?> addTasksToReservation(
            @PathVariable Long reservationId,
            @RequestBody List<TaskDto> taskDtos,
            Authentication authentication) {
        ResponseEntity<?> accessError = checkReservationAccess(reservationId, authentication, false);
        if (accessError != null) return accessError;

        try {
            List<TaskDto> addedTasks = reservationTaskService.addTasksToReservation(reservationId, taskDtos);
            return ResponseEntity.status(HttpStatus.CREATED).body(addedTasks);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Récupérer toutes les tâches d'une réservation
     */
    @GetMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('CLIENT') or hasRole('CONSULTANT')")
    public ResponseEntity<?> getReservationTasks(
            @PathVariable Long reservationId,
            Authentication authentication) {
        ResponseEntity<?> accessError = checkReservationAccess(reservationId, authentication, true);
        if (accessError != null) return accessError;

        try {
            List<TaskDto> tasks = reservationTaskService.getReservationTasks(reservationId);
            return ResponseEntity.ok(tasks);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Mettre à jour une tâche dans une réservation
     */
    @PutMapping("/{taskId}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('CONSULTANT')")
    public ResponseEntity<?> updateReservationTask(
            @PathVariable Long reservationId,
            @PathVariable Long taskId,
            @RequestBody TaskDto taskDto,
            Authentication authentication) {
        ResponseEntity<?> accessError = checkReservationAccess(reservationId, authentication, true);
        if (accessError != null) return accessError;

        try {
            TaskDto updatedTask = reservationTaskService.updateReservationTask(reservationId, taskId, taskDto);
            return ResponseEntity.ok(updatedTask);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Supprimer une tâche d'une réservation
     */
    @DeleteMapping("/{taskId}")
    @PreAuthorize("hasRole('CLIENT') or hasRole('ADMIN')")
    public ResponseEntity<?> removeTaskFromReservation(
            @PathVariable Long reservationId,
            @PathVariable Long taskId,
            Authentication authentication) {
        ResponseEntity<?> accessError = checkReservationAccess(reservationId, authentication, false);
        if (accessError != null) return accessError;

        try {
            reservationTaskService.removeTaskFromReservation(reservationId, taskId);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Calculer le prix total des tâches d'une réservation
     */
    @GetMapping("/total-price")
    @PreAuthorize("hasRole('ADMIN') or hasRole('CLIENT') or hasRole('CONSULTANT')")
    public ResponseEntity<?> calculateReservationTotalPrice(
            @PathVariable Long reservationId,
            Authentication authentication) {
        ResponseEntity<?> accessError = checkReservationAccess(reservationId, authentication, true);
        if (accessError != null) return accessError;

        try {
            Double totalPrice = reservationTaskService.calculateReservationTotalPrice(reservationId);
            return ResponseEntity.ok(totalPrice);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Calculer la durée totale des tâches d'une réservation
     */
    @GetMapping("/total-duration")
    @PreAuthorize("hasRole('ADMIN') or hasRole('CLIENT') or hasRole('CONSULTANT')")
    public ResponseEntity<?> calculateReservationTotalDuration(
            @PathVariable Long reservationId,
            Authentication authentication) {
        ResponseEntity<?> accessError = checkReservationAccess(reservationId, authentication, true);
        if (accessError != null) return accessError;

        try {
            Integer totalDuration = reservationTaskService.calculateReservationTotalDuration(reservationId);
            return ResponseEntity.ok(totalDuration);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Marquer une tâche comme terminée
     */
    @PutMapping("/{taskId}/complete")
    @PreAuthorize("hasRole('CONSULTANT') or hasRole('ADMIN')")
    public ResponseEntity<?> markTaskAsCompleted(
            @PathVariable Long reservationId,
            @PathVariable Long taskId,
            Authentication authentication) {
        ResponseEntity<?> accessError = checkReservationAccess(reservationId, authentication, true);
        if (accessError != null) return accessError;

        try {
            TaskDto completedTask = reservationTaskService.markTaskAsCompleted(reservationId, taskId);
            return ResponseEntity.ok(completedTask);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Récupérer les tâches non terminées d'une réservation
     */
    @GetMapping("/pending")
    @PreAuthorize("hasRole('ADMIN') or hasRole('CLIENT') or hasRole('CONSULTANT')")
    public ResponseEntity<?> getPendingTasks(
            @PathVariable Long reservationId,
            Authentication authentication) {
        ResponseEntity<?> accessError = checkReservationAccess(reservationId, authentication, true);
        if (accessError != null) return accessError;

        try {
            List<TaskDto> pendingTasks = reservationTaskService.getPendingTasks(reservationId);
            return ResponseEntity.ok(pendingTasks);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Récupérer les tâches terminées d'une réservation
     */
    @GetMapping("/completed")
    @PreAuthorize("hasRole('ADMIN') or hasRole('CLIENT') or hasRole('CONSULTANT')")
    public ResponseEntity<?> getCompletedTasks(
            @PathVariable Long reservationId,
            Authentication authentication) {
        ResponseEntity<?> accessError = checkReservationAccess(reservationId, authentication, true);
        if (accessError != null) return accessError;

        try {
            List<TaskDto> completedTasks = reservationTaskService.getCompletedTasks(reservationId);
            return ResponseEntity.ok(completedTasks);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Ajouter des tâches avec quantités à une réservation
     */
    @PostMapping("/with-quantities")
    @PreAuthorize("hasRole('ADMIN') or hasRole('CLIENT')")
    public ResponseEntity<?> addTasksWithQuantities(
            @PathVariable Long reservationId,
            @RequestBody TaskManagementRequest request,
            Authentication authentication) {
        ResponseEntity<?> accessError = checkReservationAccess(reservationId, authentication, false);
        if (accessError != null) return accessError;

        try {
            List<TaskDto> addedTasks = reservationTaskService.addTasksWithQuantitiesToReservation(
                    reservationId, request.getTaskIds(), request.getTaskQuantities());
            return ResponseEntity.status(HttpStatus.CREATED).body(addedTasks);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Mettre à jour la quantité d'une tâche dans une réservation
     */
    @PutMapping("/{taskId}/quantity")
    @PreAuthorize("hasRole('ADMIN') or hasRole('CLIENT')")
    public ResponseEntity<?> updateTaskQuantity(
            @PathVariable Long reservationId,
            @PathVariable Long taskId,
            @RequestBody Map<String, Integer> request,
            Authentication authentication) {
        ResponseEntity<?> accessError = checkReservationAccess(reservationId, authentication, false);
        if (accessError != null) return accessError;

        try {
            Integer quantity = request.get("quantity");
            if (quantity == null || quantity < 1) {
                return ResponseEntity.badRequest().body(Map.of("error", "La quantité doit être supérieure ou égale à 1"));
            }
            
            TaskDto updatedTask = reservationTaskService.updateTaskQuantity(reservationId, taskId, quantity);
            return ResponseEntity.ok(updatedTask);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", e.getMessage()));
        }
    }
}
