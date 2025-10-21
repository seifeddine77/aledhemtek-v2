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

    @PostMapping
    @PreAuthorize("hasRole('CLIENT') or hasRole('ADMIN')")
    public ResponseEntity<ReservationDto> createReservation(@RequestBody ReservationDto reservationDto) {
        try {
            ReservationDto createdReservation = reservationService.createReservation(reservationDto);
            return ResponseEntity.status(HttpStatus.CREATED).body(createdReservation);
        } catch (Exception e) {
            log.error("Error creating reservation: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }

    @PostMapping("/with-task-ids")
    @PreAuthorize("hasRole('CLIENT') or hasRole('ADMIN')")
    public ResponseEntity<ReservationDto> createReservationWithTaskIds(@RequestBody Map<String, Object> requestData) {
        try {
            // Extraire les données de la requête
            String title = (String) requestData.get("title");
            String description = (String) requestData.get("description");
            String startDate = (String) requestData.get("startDate");
            String endDate = (String) requestData.get("endDate");
            String status = (String) requestData.get("status");
            Boolean assigned = (Boolean) requestData.get("assigned");
            Long clientId = Long.valueOf(requestData.get("clientId").toString());
            @SuppressWarnings("unchecked")
            List<Integer> taskIdsInt = (List<Integer>) requestData.get("taskIds");
            // Notes optionnelles pour la réservation (non utilisées dans cette version)
            
            // Convertir les IDs de tâches
            List<Long> taskIds = taskIdsInt.stream().map(Long::valueOf).toList();
            
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
            reservationDto.setStartDate(LocalDateTime.parse(startDate));
            reservationDto.setEndDate(LocalDateTime.parse(endDate));
            reservationDto.setStatus(ReservationStatus.valueOf(status));
            reservationDto.setAssigned(assigned != null ? assigned : false);
            reservationDto.setClientId(clientId);
            reservationDto.setTasks(tasks);
            
            ReservationDto createdReservation = reservationService.createReservation(reservationDto);
            return ResponseEntity.status(HttpStatus.CREATED).body(createdReservation);
        } catch (Exception e) {
            log.error("Error creating reservation with task IDs: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('CLIENT')")
    public ResponseEntity<ReservationDto> updateReservation(
            @PathVariable Long id, 
            @RequestBody ReservationDto reservationDto) {
        try {
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
    public ResponseEntity<ReservationDto> getReservationById(@PathVariable Long id) {
        try {
            ReservationDto reservation = reservationService.getReservationById(id);
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
    public ResponseEntity<List<ReservationDto>> getReservationsByConsultant(@PathVariable Long consultantId) {
        List<ReservationDto> reservations = reservationService.getReservationsByConsultant(consultantId);
        return ResponseEntity.ok(reservations);
    }

    @GetMapping("/client/{clientId}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('CLIENT')")
    public ResponseEntity<List<ReservationDto>> getReservationsByClient(@PathVariable Long clientId) {
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
    public ResponseEntity<List<ReservationDto>> getConsultantCalendar(
            @PathVariable Long consultantId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate) {
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
    @PreAuthorize("hasRole('ADMIN') or hasRole('CONSULTANT')")
    public ResponseEntity<ReservationDto> updateReservationStatus(
            @PathVariable Long reservationId,
            @PathVariable String status) {
        try {
            // Convert String status to ReservationStatus enum
            ReservationStatus reservationStatus = ReservationStatus.valueOf(status.toUpperCase());
            ReservationDto updatedReservation = reservationService.updateReservationStatus(reservationId, reservationStatus);

            // Check if the status is COMPLETED to trigger auto-invoice generation
            if (reservationStatus == ReservationStatus.COMPLETED) {
                try {
                    log.info("Reservation {} completed, triggering auto-invoice generation.", reservationId);
                    autoInvoiceService.generateInvoiceForCompletedReservation(reservationId);
                    log.info("Auto-invoice generation successfully triggered for reservation {}.", reservationId);
                } catch (Exception e) {
                    log.error("Failed to auto-generate invoice for reservation {}: {}", reservationId, e.getMessage(), e);
                    // We don't want to fail the status update if invoice generation fails, so we just log the error.
                }
            }

            return ResponseEntity.ok(updatedReservation);
        } catch (IllegalArgumentException e) {
            log.error("Invalid status value provided: {}", status, e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(null);
        } catch (Exception e) {
            log.error("Error updating reservation status for reservation {}: {}", reservationId, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
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
