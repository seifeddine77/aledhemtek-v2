package com.aledhemtek.controllers;

import com.aledhemtek.dto.CategoryDto;
import com.aledhemtek.dto.ServiceDto;
import com.aledhemtek.dto.TaskDto;
import com.aledhemtek.interfaces.AdminService;
import com.aledhemtek.interfaces.CategoryService;
import com.aledhemtek.interfaces.TaskService;
import com.aledhemtek.interfaces.ReservationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/public")
public class PublicController {

    @Autowired
    private AdminService adminService;
    
    @Autowired
    private CategoryService categoryService;
    
    @Autowired
    private TaskService taskService;
    
    @Autowired
    private ReservationService reservationService;

    @GetMapping("/categories")
    public ResponseEntity<List<CategoryDto>> getAllCategories() {
        List<CategoryDto> categories = categoryService.getAllCategories();
        return ResponseEntity.ok(categories);
    }

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
}
