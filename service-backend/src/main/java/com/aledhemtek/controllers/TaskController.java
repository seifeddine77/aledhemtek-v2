package com.aledhemtek.controllers;

import com.aledhemtek.dto.MaterialDto;
import com.aledhemtek.dto.RateDto;
import com.aledhemtek.dto.TaskDto;
import com.aledhemtek.interfaces.TaskService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/tasks")
public class TaskController {

    @Autowired
    private TaskService taskService;

    /**
     * Récupérer toutes les tâches
     */
    @GetMapping
    public ResponseEntity<List<TaskDto>> getAllTasks() {
        List<TaskDto> tasks = taskService.getAllTasks();
        return ResponseEntity.ok(tasks);
    }

    /**
     * Récupérer une tâche par ID
     */
    @GetMapping("/{taskId}")
    public ResponseEntity<TaskDto> getTaskById(@PathVariable Long taskId) {
        TaskDto task = taskService.getTaskById(taskId);
        if (task != null) {
            return ResponseEntity.ok(task);
        }
        return ResponseEntity.notFound().build();
    }

    /**
     * Récupérer les tâches par service
     */
    @GetMapping("/service/{serviceId}")
    public ResponseEntity<List<TaskDto>> getTasksByService(@PathVariable Long serviceId) {
        List<TaskDto> tasks = taskService.getTasksByService(serviceId);
        return ResponseEntity.ok(tasks);
    }

    /**
     * Créer une nouvelle tâche
     */
    @PostMapping(consumes = "multipart/form-data")
    public ResponseEntity<TaskDto> createTask(
            @RequestPart("taskDto") TaskDto taskDto,
            @RequestPart("image") MultipartFile file) {
        TaskDto createdTask = taskService.createTask(taskDto, file);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdTask);
    }

    /**
     * Mettre à jour une tâche
     */
    @PutMapping("/{taskId}")
    public ResponseEntity<TaskDto> updateTask(
            @PathVariable Long taskId,
            @RequestBody TaskDto taskDto) {
        TaskDto updatedTask = taskService.updateTask(taskId, taskDto);
        if (updatedTask != null) {
            return ResponseEntity.ok(updatedTask);
        }
        return ResponseEntity.notFound().build();
    }

    /**
     * Supprimer une tâche
     */
    @DeleteMapping("/{taskId}")
    public ResponseEntity<Void> deleteTask(@PathVariable Long taskId) {
        taskService.deleteTask(taskId);
        return ResponseEntity.noContent().build();
    }

    /**
     * Ajouter un tarif à une tâche
     */
    @PostMapping("/{taskId}/rates")
    public ResponseEntity<RateDto> addRateToTask(
            @PathVariable Long taskId,
            @RequestBody RateDto rateDto) {
        RateDto createdRate = taskService.addRateToTask(taskId, rateDto);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdRate);
    }

    /**
     * Récupérer les tarifs d'une tâche
     */
    @GetMapping("/{taskId}/rates")
    public ResponseEntity<List<RateDto>> getTaskRates(@PathVariable Long taskId) {
        List<RateDto> rates = taskService.getTaskRates(taskId);
        return ResponseEntity.ok(rates);
    }

    /**
     * Mettre à jour un tarif
     */
    @PutMapping("/rates/{rateId}")
    public ResponseEntity<RateDto> updateRate(
            @PathVariable Long rateId,
            @RequestBody RateDto rateDto) {
        RateDto updatedRate = taskService.updateRate(rateId, rateDto);
        if (updatedRate != null) {
            return ResponseEntity.ok(updatedRate);
        }
        return ResponseEntity.notFound().build();
    }

    /**
     * Supprimer un tarif
     */
    @DeleteMapping("/rates/{rateId}")
    public ResponseEntity<Void> deleteRate(@PathVariable Long rateId) {
        taskService.deleteRate(rateId);
        return ResponseEntity.noContent().build();
    }

    /**
     * Ajouter un matériau à une tâche
     */
    @PostMapping("/{taskId}/materials")
    public ResponseEntity<MaterialDto> addMaterialToTask(
            @PathVariable Long taskId,
            @RequestBody MaterialDto materialDto) {
        MaterialDto createdMaterial = taskService.addMaterialToTask(taskId, materialDto);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdMaterial);
    }

    /**
     * Récupérer les matériaux d'une tâche
     */
    @GetMapping("/{taskId}/materials")
    public ResponseEntity<List<MaterialDto>> getTaskMaterials(@PathVariable Long taskId) {
        List<MaterialDto> materials = taskService.getTaskMaterials(taskId);
        return ResponseEntity.ok(materials);
    }

    /**
     * Mettre à jour un matériau
     */
    @PutMapping("/materials/{materialId}")
    public ResponseEntity<MaterialDto> updateMaterial(
            @PathVariable Long materialId,
            @RequestBody MaterialDto materialDto) {
        MaterialDto updatedMaterial = taskService.updateMaterial(materialId, materialDto);
        if (updatedMaterial != null) {
            return ResponseEntity.ok(updatedMaterial);
        }
        return ResponseEntity.notFound().build();
    }

    /**
     * Supprimer un matériau
     */
    @DeleteMapping("/materials/{materialId}")
    public ResponseEntity<Void> deleteMaterial(@PathVariable Long materialId) {
        taskService.deleteMaterial(materialId);
        return ResponseEntity.noContent().build();
    }

    /**
     * Calculer le prix total d'une tâche
     */
    @GetMapping("/{taskId}/total-price")
    public ResponseEntity<Double> calculateTaskTotalPrice(@PathVariable Long taskId) {
        Double totalPrice = taskService.calculateTaskTotalPrice(taskId);
        return ResponseEntity.ok(totalPrice);
    }

    /**
     * Rechercher des tâches par nom
     */
    @GetMapping("/search")
    public ResponseEntity<List<TaskDto>> searchTasks(@RequestParam String keyword) {
        List<TaskDto> tasks = taskService.searchTasksByName(keyword);
        return ResponseEntity.ok(tasks);
    }
}
