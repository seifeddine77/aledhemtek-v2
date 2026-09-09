package com.aledhemtek.controllers;

import com.aledhemtek.dto.ReservationDto;
import com.aledhemtek.dto.TaskDto;

import com.aledhemtek.interfaces.ReservationService;
import com.aledhemtek.services.AutoInvoiceService;
import com.aledhemtek.model.Rate;
import com.aledhemtek.model.Reservation.ReservationStatus;
import com.aledhemtek.model.Task;
import com.aledhemtek.repositories.TaskRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import com.aledhemtek.config.CustomUserDetails;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/reservations")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:4200")
@Slf4j
public class ReservationController {

    private final ReservationService reservationService;
    private final TaskRepository taskRepository;
    private final AutoInvoiceService autoInvoiceService;

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

    private LocalDateTime parseDateTime(String dateStr) {
        if (dateStr == null || dateStr.isBlank()) return null;
        try {
            if (dateStr.endsWith("Z")) {
                return java.time.Instant.parse(dateStr).atZone(java.time.ZoneId.systemDefault()).toLocalDateTime();
            }
            if (dateStr.contains("+")) {
                return java.time.OffsetDateTime.parse(dateStr).toLocalDateTime();
            }
            return LocalDateTime.parse(dateStr);
        } catch (Exception e) {
            if (dateStr.length() >= 19) {
                return LocalDateTime.parse(dateStr.substring(0, 19));
            }
            throw new IllegalArgumentException("Invalid date format: " + dateStr);
        }
    }

    @PostMapping
    @PreAuthorize("hasRole('CLIENT') or hasRole('ADMIN')")
    public ResponseEntity<ReservationDto> createReservation(@RequestBody ReservationDto reservationDto, Authentication authentication) {
        try {
            if (!isAdmin(authentication)) {
                Long authUserId = getAuthenticatedUserId(authentication);
                reservationDto.setClientId(authUserId);
                reservationDto.setStatus(ReservationStatus.PENDING);
                reservationDto.setAssigned(false);
                reservationDto.setConsultantId(null);
            }
            ReservationDto createdReservation = reservationService.createReservation(reservationDto);
            return ResponseEntity.status(HttpStatus.CREATED).body(createdReservation);
        } catch (Exception e) {
            log.error("Error creating reservation: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }

    @PostMapping("/with-task-ids")
    @PreAuthorize("hasRole('CLIENT') or hasRole('ADMIN')")
    public ResponseEntity<ReservationDto> createReservationWithTaskIds(@RequestBody Map<String, Object> requestData, Authentication authentication) {
        try {
            // Extraire les données de la requête
            String title = (String) requestData.get("title");
            String description = (String) requestData.get("description");
            String startDate = (String) requestData.get("startDate");
            String endDate = (String) requestData.get("endDate");
            
            Long authUserId = getAuthenticatedUserId(authentication);
            Long clientId;
            ReservationStatus reservationStatus;
            Boolean assigned;
            
            if (!isAdmin(authentication)) {
                clientId = authUserId;
                reservationStatus = ReservationStatus.PENDING;
                assigned = false;
            } else {
                clientId = requestData.get("clientId") != null ? Long.valueOf(requestData.get("clientId").toString()) : authUserId;
                String statusStr = (String) requestData.get("status");
                reservationStatus = statusStr != null ? ReservationStatus.valueOf(statusStr) : ReservationStatus.PENDING;
                assigned = (Boolean) requestData.get("assigned");
            }
            
            @SuppressWarnings("unchecked")
            List<Integer> taskIdsInt = (List<Integer>) requestData.get("taskIds");
            
            // Convertir les IDs de tâches
            List<Long> taskIds = taskIdsInt != null ? taskIdsInt.stream().map(Long::valueOf).toList() : List.of();
            
            // Créer les TaskDto à partir des IDs
            List<TaskDto> tasks = taskIds.stream().map(taskId -> {
                TaskDto taskDto = new TaskDto();
                taskDto.setId(taskId);
                return taskDto;
            }).toList();
            
            // Créer le ReservationDto
            ReservationDto reservationDto = new ReservationDto();
            reservationDto.setTitle(title);
            reservationDto.setDescription(description);
            reservationDto.setStartDate(parseDateTime(startDate));
            reservationDto.setEndDate(parseDateTime(endDate));
            reservationDto.setStatus(reservationStatus);
            reservationDto.setAssigned(assigned != null ? assigned : false);
            reservationDto.setClientId(clientId);
            reservationDto.setTasks(tasks);
            if (requestData.get("housingType") != null) {
                reservationDto.setHousingType(requestData.get("housingType").toString());
            }
            if (requestData.get("urgency") != null) {
                reservationDto.setUrgency(requestData.get("urgency").toString());
            }
            if (requestData.get("buildingDetails") != null) {
                reservationDto.setBuildingDetails(requestData.get("buildingDetails").toString());
            }
            if (requestData.get("address") != null) {
                reservationDto.setAddress(requestData.get("address").toString());
            }
            if (requestData.get("latitude") != null) {
                reservationDto.setLatitude(Double.valueOf(requestData.get("latitude").toString()));
            }
            if (requestData.get("longitude") != null) {
                reservationDto.setLongitude(Double.valueOf(requestData.get("longitude").toString()));
            }
            
            ReservationDto createdReservation = reservationService.createReservation(reservationDto);
            return ResponseEntity.status(HttpStatus.CREATED).body(createdReservation);
        } catch (Exception e) {
            log.error("Error creating reservation with task IDs: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('CLIENT')")
    public ResponseEntity<?> updateReservation(
            @PathVariable Long id, 
            @RequestBody ReservationDto reservationDto,
            Authentication authentication) {
        try {
            ReservationDto existing = reservationService.getReservationById(id);
            if (existing == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
            }
            if (!isAdmin(authentication)) {
                Long authUserId = getAuthenticatedUserId(authentication);
                if (!existing.getClientId().equals(authUserId)) {
                    return ResponseEntity.status(HttpStatus.FORBIDDEN)
                            .body(Map.of("error", "Access denied - You can only update your own reservations"));
                }
                // Client cannot arbitrarily change status, assigned, or consultantId via update
                reservationDto.setStatus(existing.getStatus());
                reservationDto.setAssigned(existing.isAssigned());
                reservationDto.setConsultantId(existing.getConsultantId());
                reservationDto.setClientId(existing.getClientId());
            }
            ReservationDto updatedReservation = reservationService.updateReservation(id, reservationDto);
            return ResponseEntity.ok(updatedReservation);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteReservation(@PathVariable Long id) {
        try {
            reservationService.deleteReservation(id);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('CLIENT') or hasRole('CONSULTANT')")
    public ResponseEntity<?> getReservationById(@PathVariable Long id, Authentication authentication) {
        try {
            ReservationDto reservation = reservationService.getReservationById(id);
            if (reservation == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
            }
            if (!isAdmin(authentication)) {
                Long authUserId = getAuthenticatedUserId(authentication);
                boolean isClientOwner = reservation.getClientId() != null && reservation.getClientId().equals(authUserId);
                boolean isConsultantOwner = reservation.getConsultantId() != null && reservation.getConsultantId().equals(authUserId);
                if (!isClientOwner && !isConsultantOwner) {
                    return ResponseEntity.status(HttpStatus.FORBIDDEN)
                            .body(Map.of("error", "Access denied - You cannot view this reservation"));
                }
            }
            return ResponseEntity.ok(reservation);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<ReservationDto>> getAllReservations() {
        List<ReservationDto> reservations = reservationService.getAllReservations();
        return ResponseEntity.ok(reservations);
    }

    @GetMapping("/consultant/{consultantId}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('CONSULTANT')")
    public ResponseEntity<?> getReservationsByConsultant(@PathVariable Long consultantId, Authentication authentication) {
        if (!isAdmin(authentication)) {
            Long authUserId = getAuthenticatedUserId(authentication);
            if (!consultantId.equals(authUserId)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(Map.of("error", "Access denied - You can only view your own assigned reservations"));
            }
        }
        List<ReservationDto> reservations = reservationService.getReservationsByConsultant(consultantId);
        return ResponseEntity.ok(reservations);
    }

    @GetMapping("/client/{clientId}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('CLIENT')")
    public ResponseEntity<?> getReservationsByClient(@PathVariable Long clientId, Authentication authentication) {
        if (!isAdmin(authentication)) {
            Long authUserId = getAuthenticatedUserId(authentication);
            if (!clientId.equals(authUserId)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(Map.of("error", "Access denied - You can only view your own reservations"));
            }
        }
        log.info("Getting reservations for client ID: {}", clientId);
        List<ReservationDto> reservations = reservationService.getReservationsByClient(clientId);
        log.info("Found {} reservations for client {}", reservations.size(), clientId);
        return ResponseEntity.ok(reservations);
    }

    @GetMapping("/status/{status}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<ReservationDto>> getReservationsByStatus(@PathVariable String status) {
        try {
            ReservationStatus reservationStatus = ReservationStatus.valueOf(status.toUpperCase());
            List<ReservationDto> reservations = reservationService.getReservationsByStatus(reservationStatus);
            return ResponseEntity.ok(reservations);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }

    @GetMapping("/calendar/consultant/{consultantId}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('CONSULTANT')")
    public ResponseEntity<?> getConsultantCalendar(
            @PathVariable Long consultantId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate,
            Authentication authentication) {
        if (!isAdmin(authentication)) {
            Long authUserId = getAuthenticatedUserId(authentication);
            if (!consultantId.equals(authUserId)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(Map.of("error", "Access denied - You can only view your own calendar"));
            }
        }
        List<ReservationDto> calendar = reservationService.getConsultantCalendar(consultantId, startDate, endDate);
        return ResponseEntity.ok(calendar);
    }

    @GetMapping("/unassigned")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<ReservationDto>> getUnassignedReservations() {
        List<ReservationDto> unassignedReservations = reservationService.getUnassignedReservations();
        return ResponseEntity.ok(unassignedReservations);
    }

    @PutMapping("/{reservationId}/assign/{consultantId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ReservationDto> assignConsultantToReservation(
            @PathVariable Long reservationId,
            @PathVariable Long consultantId) {
        try {
            ReservationDto updatedReservation = reservationService.assignConsultantToReservation(reservationId, consultantId);
            return ResponseEntity.ok(updatedReservation);
        } catch (Exception e) {
            log.error("Error assigning consultant to reservation: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }

    @PutMapping("/{reservationId}/status/{status}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('CONSULTANT') or hasRole('CLIENT')")
    public ResponseEntity<?> updateReservationStatus(
            @PathVariable Long reservationId,
            @PathVariable String status,
            Authentication authentication) {
        try {
            ReservationDto existing = reservationService.getReservationById(reservationId);
            if (existing == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("error", "Reservation not found"));
            }
            ReservationStatus reservationStatus = ReservationStatus.valueOf(status.toUpperCase());
            
            if (!isAdmin(authentication)) {
                Long authUserId = getAuthenticatedUserId(authentication);
                boolean isAssignedConsultant = existing.getConsultantId() != null && existing.getConsultantId().equals(authUserId);
                boolean isOwnerClient = existing.getClientId() != null && existing.getClientId().equals(authUserId);
                
                if (isAssignedConsultant) {
                    // Consultant can advance status
                } else if (isOwnerClient) {
                    // Client can ONLY cancel
                    if (reservationStatus != ReservationStatus.CANCELLED) {
                        return ResponseEntity.status(HttpStatus.FORBIDDEN)
                                .body(Map.of("error", "Access denied - Clients can only cancel reservations"));
                    }
                } else {
                    return ResponseEntity.status(HttpStatus.FORBIDDEN)
                            .body(Map.of("error", "Access denied - You are not authorized to update this reservation"));
                }
            }
            
            ReservationDto updatedReservation = reservationService.updateReservationStatus(reservationId, reservationStatus);
            return ResponseEntity.ok(updatedReservation);
        } catch (IllegalArgumentException e) {
            log.error("Invalid status value provided: {}", status, e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", "Statut invalide: " + status));
        } catch (IllegalStateException e) {
            log.warn("Invalid state transition for reservation {}: {}", reservationId, e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            log.error("Error updating reservation status for reservation {}: {}", reservationId, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/consultant/{consultantId}/available")
    @PreAuthorize("hasRole('ADMIN') or hasRole('CONSULTANT')")
    public ResponseEntity<Boolean> isConsultantAvailable(
            @PathVariable Long consultantId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate) {
        boolean available = reservationService.isConsultantAvailable(consultantId, startDate, endDate);
        return ResponseEntity.ok(available);
    }
    
    @GetMapping("/{id}/total-price")
    @PreAuthorize("hasRole('ADMIN') or hasRole('CLIENT') or hasRole('CONSULTANT')")
    public ResponseEntity<Double> getReservationTotalPrice(@PathVariable Long id) {
        try {
            Double totalPrice = reservationService.calculateReservationTotalPrice(id);
            return ResponseEntity.ok(totalPrice);
        } catch (Exception e) {
            log.error("Error calculating reservation total price: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }
    
    @PostMapping("/calculate-price")
    @PreAuthorize("hasRole('ADMIN') or hasRole('CLIENT')")
    public ResponseEntity<Double> calculateTasksPrice(@RequestBody List<Long> taskIds) {
        try {
            // Récupérer les tâches du catalogue
            List<Task> tasks = new ArrayList<>();
            for (Long taskId : taskIds) {
                Task task = taskRepository.findById(taskId)
                    .orElseThrow(() -> new RuntimeException("Task not found: " + taskId));
                tasks.add(task);
            }
            
            Double totalPrice = reservationService.calculateTasksTotalPrice(tasks);
            return ResponseEntity.ok(totalPrice);
        } catch (Exception e) {
            log.error("Error calculating tasks price: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }
    
    /**
     * Obtenir le prix d'une tâche avec différentes stratégies
     */
    @GetMapping("/task/{taskId}/price")
    @PreAuthorize("hasRole('ADMIN') or hasRole('CLIENT') or hasRole('CONSULTANT')")
    public ResponseEntity<Map<String, Double>> getTaskPriceStrategies(@PathVariable Long taskId) {
        try {
            Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Task not found: " + taskId));
            
            Map<String, Double> priceStrategies = new HashMap<>();
            priceStrategies.put("min", reservationService.calculateTaskPrice(task));
            priceStrategies.put("current", reservationService.calculateTaskPrice(task)); // Prix actuel (min)
            
            // Calculer aussi max et avg si plusieurs tarifs
            if (task.getRates() != null && task.getRates().size() > 1) {
                List<Double> validPrices = task.getRates().stream()
                    .filter(rate -> {
                        LocalDateTime now = LocalDateTime.now();
                        LocalDateTime rateDate = now.toLocalDate().atStartOfDay();
                        boolean afterStart = rate.getStartDate() == null || 
                            !rateDate.toLocalDate().isBefore(rate.getStartDate());
                        boolean beforeEnd = rate.getEndDate() == null || 
                            !rateDate.toLocalDate().isAfter(rate.getEndDate());
                        return afterStart && beforeEnd;
                    })
                    .map(Rate::getPrice)
                    .collect(Collectors.toList());
                    
                if (!validPrices.isEmpty()) {
                    priceStrategies.put("max", validPrices.stream().mapToDouble(Double::doubleValue).max().orElse(0.0));
                    priceStrategies.put("avg", validPrices.stream().mapToDouble(Double::doubleValue).average().orElse(0.0));
                }
            }
            
            return ResponseEntity.ok(priceStrategies);
        } catch (Exception e) {
            log.error("Error getting task price strategies: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }
}
