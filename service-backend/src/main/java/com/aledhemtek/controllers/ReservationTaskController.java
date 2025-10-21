package com.aledhemtek.controllers;

import com.aledhemtek.dto.TaskDto;
import com.aledhemtek.dto.TaskManagementRequest;
import com.aledhemtek.interfaces.ReservationTaskService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/reservations/{reservationId}/tasks")
@CrossOrigin(origins = "http://localhost:4200")
public class ReservationTaskController {

    @Autowired
    private ReservationTaskService reservationTaskService;

    /**
     * Ajouter une tâche à une réservation
     */
    @PostMapping
    @PreAuthorize("hasRole('CLIENT') or hasRole('ADMIN')")
    public ResponseEntity<TaskDto> addTaskToReservation(
            @PathVariable Long reservationId,
            @RequestBody TaskDto taskDto) {
        try {
            TaskDto addedTask = reservationTaskService.addTaskToReservation(reservationId, taskDto);
            return ResponseEntity.status(HttpStatus.CREATED).body(addedTask);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }

    /**
     * Ajouter plusieurs tâches à une réservation
     */
    @PostMapping("/batch")
    @PreAuthorize("hasRole('CLIENT') or hasRole('ADMIN')")
    public ResponseEntity<List<TaskDto>> addTasksToReservation(
            @PathVariable Long reservationId,
            @RequestBody List<TaskDto> taskDtos) {
        try {
            List<TaskDto> addedTasks = reservationTaskService.addTasksToReservation(reservationId, taskDtos);
            return ResponseEntity.status(HttpStatus.CREATED).body(addedTasks);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }

    /**
     * Récupérer toutes les tâches d'une réservation
     */
    @GetMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('CLIENT') or hasRole('CONSULTANT')")
    public ResponseEntity<List<TaskDto>> getReservationTasks(@PathVariable Long reservationId) {
        try {
            List<TaskDto> tasks = reservationTaskService.getReservationTasks(reservationId);
            return ResponseEntity.ok(tasks);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }

    /**
     * Mettre à jour une tâche dans une réservation
     */
    @PutMapping("/{taskId}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('CONSULTANT')")
    public ResponseEntity<TaskDto> updateReservationTask(
            @PathVariable Long reservationId,
            @PathVariable Long taskId,
            @RequestBody TaskDto taskDto) {
        try {
            TaskDto updatedTask = reservationTaskService.updateReservationTask(reservationId, taskId, taskDto);
            return ResponseEntity.ok(updatedTask);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }

    /**
     * Supprimer une tâche d'une réservation
     */
    @DeleteMapping("/{taskId}")
    @PreAuthorize("hasRole('CLIENT') or hasRole('ADMIN')")
    public ResponseEntity<Void> removeTaskFromReservation(
            @PathVariable Long reservationId,
            @PathVariable Long taskId) {
        try {
            reservationTaskService.removeTaskFromReservation(reservationId, taskId);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }

    /**
     * Calculer le prix total des tâches d'une réservation
     */
    @GetMapping("/total-price")
    @PreAuthorize("hasRole('ADMIN') or hasRole('CLIENT') or hasRole('CONSULTANT')")
    public ResponseEntity<Double> calculateReservationTotalPrice(@PathVariable Long reservationId) {
        try {
            Double totalPrice = reservationTaskService.calculateReservationTotalPrice(reservationId);
            return ResponseEntity.ok(totalPrice);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }

    /**
     * Calculer la durée totale des tâches d'une réservation
     */
    @GetMapping("/total-duration")
    @PreAuthorize("hasRole('ADMIN') or hasRole('CLIENT') or hasRole('CONSULTANT')")
    public ResponseEntity<Integer> calculateReservationTotalDuration(@PathVariable Long reservationId) {
        try {
            Integer totalDuration = reservationTaskService.calculateReservationTotalDuration(reservationId);
            return ResponseEntity.ok(totalDuration);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }

    /**
     * Marquer une tâche comme terminée
     */
    @PutMapping("/{taskId}/complete")
    @PreAuthorize("hasRole('CONSULTANT') or hasRole('ADMIN')")
    public ResponseEntity<TaskDto> markTaskAsCompleted(
            @PathVariable Long reservationId,
            @PathVariable Long taskId) {
        try {
            TaskDto completedTask = reservationTaskService.markTaskAsCompleted(reservationId, taskId);
            return ResponseEntity.ok(completedTask);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }

    /**
     * Récupérer les tâches non terminées d'une réservation
     */
    @GetMapping("/pending")
    @PreAuthorize("hasRole('ADMIN') or hasRole('CLIENT') or hasRole('CONSULTANT')")
    public ResponseEntity<List<TaskDto>> getPendingTasks(@PathVariable Long reservationId) {
        try {
            List<TaskDto> pendingTasks = reservationTaskService.getPendingTasks(reservationId);
            return ResponseEntity.ok(pendingTasks);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }

    /**
     * Récupérer les tâches terminées d'une réservation
     */
    @GetMapping("/completed")
    @PreAuthorize("hasRole('ADMIN') or hasRole('CLIENT') or hasRole('CONSULTANT')")
    public ResponseEntity<List<TaskDto>> getCompletedTasks(@PathVariable Long reservationId) {
        try {
            List<TaskDto> completedTasks = reservationTaskService.getCompletedTasks(reservationId);
            return ResponseEntity.ok(completedTasks);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }

    /**
     * Ajouter des tâches avec quantités à une réservation
     */
    @PostMapping("/with-quantities")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<TaskDto>> addTasksWithQuantities(
            @PathVariable Long reservationId,
            @RequestBody TaskManagementRequest request) {
        try {
            List<TaskDto> addedTasks = reservationTaskService.addTasksWithQuantitiesToReservation(
                    reservationId, request.getTaskIds(), request.getTaskQuantities());
            return ResponseEntity.status(HttpStatus.CREATED).body(addedTasks);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }

    /**
     * Mettre à jour la quantité d'une tâche dans une réservation
     */
    @PutMapping("/{taskId}/quantity")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<TaskDto> updateTaskQuantity(
            @PathVariable Long reservationId,
            @PathVariable Long taskId,
            @RequestBody Map<String, Integer> request) {
        try {
            Integer quantity = request.get("quantity");
            if (quantity == null || quantity < 1) {
                return ResponseEntity.badRequest().build();
            }
            
            TaskDto updatedTask = reservationTaskService.updateTaskQuantity(reservationId, taskId, quantity);
            return ResponseEntity.ok(updatedTask);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }
}
