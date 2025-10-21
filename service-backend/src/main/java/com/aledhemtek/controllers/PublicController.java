package com.aledhemtek.controllers;

import com.aledhemtek.dto.ServiceDto;
import com.aledhemtek.dto.TaskDto;
import com.aledhemtek.dto.ReservationDto;
import com.aledhemtek.interfaces.AdminService;
import com.aledhemtek.interfaces.EvaluationService;
import com.aledhemtek.interfaces.TaskService;
import com.aledhemtek.interfaces.ReservationService;
import com.aledhemtek.model.Reservation.ReservationStatus;
import com.aledhemtek.model.User;
import com.aledhemtek.repositories.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/public")
public class PublicController {

    @Autowired
    private AdminService adminService;
    
    @Autowired
    private TaskService taskService;
    
    @Autowired
    private ReservationService reservationService;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private EvaluationService evaluationService;

    @GetMapping("/services")
    public ResponseEntity<List<ServiceDto>> getAllServices() {
        List<ServiceDto> services = adminService.getAllServices();
        return ResponseEntity.ok(services);
    }
    
    @GetMapping("/tasks")
    public ResponseEntity<List<TaskDto>> getAllTasks() {
        List<TaskDto> tasks = taskService.getAllTasks();
        return ResponseEntity.ok(tasks);
    }
    
    @GetMapping("/tasks/service/{serviceId}")
    public ResponseEntity<List<TaskDto>> getTasksByService(@PathVariable Long serviceId) {
        List<TaskDto> tasks = taskService.getTasksByService(serviceId);
        return ResponseEntity.ok(tasks);
    }
    

    
    @GetMapping("/test-client")
    public ResponseEntity<Map<String, Object>> getTestClient() {
        try {
            // Récupérer le client de test
            Optional<User> clientOpt = userRepository.findByEmail("client@test.com");
            if (clientOpt.isPresent()) {
                User client = clientOpt.get();
                Map<String, Object> clientInfo = new HashMap<>();
                clientInfo.put("id", client.getId());
                clientInfo.put("email", client.getEmail());
                clientInfo.put("firstName", client.getFirstName());
                clientInfo.put("lastName", client.getLastName());
                return ResponseEntity.ok(clientInfo);
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", "Client de test non trouvé"));
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Erreur lors de la récupération du client: " + e.getMessage()));
        }
    }
    
    @PostMapping("/create-reservation")
    public ResponseEntity<String> createReservationPublic(@RequestBody Map<String, Object> requestData) {
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
            // String notes = (String) requestData.get("notes"); // Notes non utilisées pour l'instant
            
            // Extraire les données de géolocalisation
            Double latitude = requestData.get("latitude") != null ? Double.valueOf(requestData.get("latitude").toString()) : null;
            Double longitude = requestData.get("longitude") != null ? Double.valueOf(requestData.get("longitude").toString()) : null;
            String address = (String) requestData.get("address");
            
            // Validation des données requises
            if (title == null || title.trim().isEmpty()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Le titre est requis");
            }
            if (startDate == null || endDate == null) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Les dates de début et fin sont requises");
            }
            if (clientId == null) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("L'ID du client est requis");
            }
            
            // Vérifier que le client existe
            try {
                // Tentative de récupération du client pour validation
                // Note: Ceci sera remplacé par un vrai service client plus tard
                if (clientId <= 0) {
                    return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("ID client invalide: " + clientId);
                }
            } catch (Exception e) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Client introuvable avec l'ID: " + clientId);
            }
            if (taskIdsInt == null || taskIdsInt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Au moins une tâche doit être sélectionnée");
            }
            
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
            // Parser les dates ISO avec timezone
            LocalDateTime startDateTime, endDateTime;
            try {
                // Si la date contient 'T' et possiblement une timezone, la nettoyer
                String cleanStartDate = startDate.contains("T") ? startDate.substring(0, 19) : startDate;
                String cleanEndDate = endDate.contains("T") ? endDate.substring(0, 19) : endDate;
                
                startDateTime = LocalDateTime.parse(cleanStartDate);
                endDateTime = LocalDateTime.parse(cleanEndDate);
            } catch (Exception e) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Format de date invalide. Utilisez le format: yyyy-MM-ddTHH:mm:ss");
            }
            
            reservationDto.setStartDate(startDateTime);
            reservationDto.setEndDate(endDateTime);
            reservationDto.setStatus(ReservationStatus.valueOf(status));
            reservationDto.setAssigned(assigned != null ? assigned : false);
            reservationDto.setClientId(clientId);
            reservationDto.setTasks(tasks);
            
            // Assigner les données de géolocalisation
            reservationDto.setLatitude(latitude);
            reservationDto.setLongitude(longitude);
            reservationDto.setAddress(address);
            
            ReservationDto createdReservation = reservationService.createReservation(reservationDto);
            return ResponseEntity.status(HttpStatus.CREATED).body("Réservation créée avec succès! ID: " + createdReservation.getId());
        } catch (Exception e) {
            e.printStackTrace(); // Pour voir l'erreur complète dans les logs
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Erreur lors de la création de la réservation: " + e.getMessage() + " - Cause: " + (e.getCause() != null ? e.getCause().getMessage() : "Aucune"));
        }
    }
    
    @PostMapping("/calculate-price")
    public ResponseEntity<Map<String, Object>> calculateTasksPrice(@RequestBody Map<String, Object> requestData) {
        try {
            @SuppressWarnings("unchecked")
            List<Integer> taskIdsInt = (List<Integer>) requestData.get("taskIds");
            @SuppressWarnings("unchecked")
            Map<String, Integer> taskQuantities = (Map<String, Integer>) requestData.get("taskQuantities");
            
            if (taskIdsInt == null || taskIdsInt.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Liste des tâches vide"));
            }
            
            // Convertir Integer en Long
            List<Long> taskIds = taskIdsInt.stream().map(Integer::longValue).toList();
            
            // Calculer le prix total avec quantités
            double totalPrice;
            if (taskQuantities != null && !taskQuantities.isEmpty()) {
                // Calculer avec quantités
                totalPrice = reservationService.calculateTasksTotalPriceWithQuantities(taskIds, taskQuantities);
            } else {
                // Fallback sur l'ancienne méthode (quantité = 1 pour chaque tâche)
                totalPrice = reservationService.calculateTasksTotalPriceByIds(taskIds);
            }
            
            Map<String, Object> response = new HashMap<>();
            response.put("totalPrice", totalPrice);
            response.put("taskIds", taskIds);
            response.put("taskQuantities", taskQuantities);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Erreur lors du calcul du prix: " + e.getMessage()));
        }
    }

    /**
     * Créer des évaluations de test pour la démonstration
     */
    @PostMapping("/create-sample-evaluations")
    public ResponseEntity<String> createSampleEvaluations() {
        try {
            evaluationService.createSampleEvaluations();
            return ResponseEntity.ok("Evaluations de test créées avec succès");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Erreur lors de la création des évaluations de test: " + e.getMessage());
        }
    }
}
