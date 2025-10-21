package com.aledhemtek.services;

import com.aledhemtek.dto.MaterialDto;
import com.aledhemtek.dto.RateDto;
import com.aledhemtek.dto.TaskDto;
import com.aledhemtek.interfaces.StorageService;
import com.aledhemtek.interfaces.TaskService;
import com.aledhemtek.model.*;
import com.aledhemtek.repositories.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class TaskServiceImpl implements TaskService {

    @Autowired
    private TaskRepository taskRepository;

    @Autowired
    private ServiceRepository serviceRepository;

    @Autowired
    private RateRepository rateRepository;

    @Autowired
    private MaterialRepository materialRepository;

    @Autowired
    private StorageService storageService;

    @Override
    public List<TaskDto> getAllTasks() {
        return taskRepository.findAll()
                .stream()
                .map(Task::getTaskDto)
                .collect(Collectors.toList());
    }

    @Override
    public TaskDto getTaskById(Long taskId) {
        return taskRepository.findById(taskId)
                .map(Task::getTaskDto)
                .orElse(null);
    }

    @Override
    public List<TaskDto> getTasksByService(Long serviceId) {
        return taskRepository.findAll()
                .stream()
                .filter(task -> task.getService().getId().equals(serviceId))
                .map(Task::getTaskDto)
                .collect(Collectors.toList());
    }

    @Override
    public TaskDto createTask(TaskDto taskDto, MultipartFile file) {
        try {
            // Vérifier que le service existe
            com.aledhemtek.model.Service service = serviceRepository.findById(taskDto.getServiceId())
                    .orElseThrow(() -> new RuntimeException("Service not found with id: " + taskDto.getServiceId()));

            // Stocker l'image
            String imageName = storageService.store(file, "tasks");

            // Créer la tâche
            Task task = new Task();
            task.setName(taskDto.getName());
            task.setDescription(taskDto.getDescription());
            task.setDuration(taskDto.getDuration());
            task.setImageName(imageName);
            task.setService(service);

            // Sauvegarder la tâche d'abord
            Task savedTask = taskRepository.save(task);

            // Ajouter les tarifs si présents
            if (taskDto.getRates() != null && !taskDto.getRates().isEmpty()) {
                List<Rate> rates = taskDto.getRates().stream().map(rateDto -> {
                    Rate rate = new Rate();
                    rate.setPrice(rateDto.getPrice());
                    rate.setStartDate(rateDto.getStartDate());
                    rate.setEndDate(rateDto.getEndDate());
                    return rateRepository.save(rate);
                }).collect(Collectors.toList());
                savedTask.setRates(rates);
            }

            // Ajouter les matériaux si présents
            if (taskDto.getMaterials() != null && !taskDto.getMaterials().isEmpty()) {
                final Task finalSavedTask = savedTask; // Variable finale pour lambda
                List<Material> materials = taskDto.getMaterials().stream().map(materialDto -> {
                    Material material = new Material();
                    material.setName(materialDto.getName());
                    material.setQuantity(materialDto.getQuantity());
                    material.setTask(finalSavedTask);
                    return materialRepository.save(material);
                }).collect(Collectors.toList());
                savedTask.setMaterials(materials);
            }

            // Sauvegarder à nouveau avec les relations
            Task finalTask = taskRepository.save(savedTask);
            return finalTask.getTaskDto();

        } catch (Exception e) {
            throw new RuntimeException("Failed to create task: " + e.getMessage(), e);
        }
    }

    @Override
    public TaskDto updateTask(Long taskId, TaskDto taskDto) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Task not found with id: " + taskId));

        // Mettre à jour les champs de base
        task.setName(taskDto.getName());
        task.setDescription(taskDto.getDescription());
        task.setDuration(taskDto.getDuration());

        // Mettre à jour le service si nécessaire
        if (taskDto.getServiceId() != null && !taskDto.getServiceId().equals(task.getService().getId())) {
            com.aledhemtek.model.Service service = serviceRepository.findById(taskDto.getServiceId())
                    .orElseThrow(() -> new RuntimeException("Service not found with id: " + taskDto.getServiceId()));
            task.setService(service);
        }

        Task updatedTask = taskRepository.save(task);
        return updatedTask.getTaskDto();
    }

    @Override
    public void deleteTask(Long taskId) {
        if (!taskRepository.existsById(taskId)) {
            throw new RuntimeException("Task not found with id: " + taskId);
        }
        taskRepository.deleteById(taskId);
    }

    @Override
    public RateDto addRateToTask(Long taskId, RateDto rateDto) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Task not found with id: " + taskId));

        Rate rate = new Rate();
        rate.setPrice(rateDto.getPrice());
        rate.setStartDate(rateDto.getStartDate());
        rate.setEndDate(rateDto.getEndDate());
        rate.setTask(task); // Associer le tarif à la tâche

        Rate savedRate = rateRepository.save(rate);

        // Ajouter le tarif à la collection de la tâche
        if (task.getRates() == null) {
            task.setRates(new ArrayList<>());
        }
        task.getRates().add(savedRate);
        taskRepository.save(task);

        return savedRate.getRateDto();
    }

    @Override
    public List<RateDto> getTaskRates(Long taskId) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Task not found with id: " + taskId));

        if (task.getRates() == null) {
            return List.of();
        }

        return task.getRates().stream()
                .map(Rate::getRateDto)
                .collect(Collectors.toList());
    }

    @Override
    public RateDto updateRate(Long rateId, RateDto rateDto) {
        Rate rate = rateRepository.findById(rateId)
                .orElseThrow(() -> new RuntimeException("Rate not found with id: " + rateId));

        rate.setPrice(rateDto.getPrice());
        rate.setStartDate(rateDto.getStartDate());
        rate.setEndDate(rateDto.getEndDate());

        Rate updatedRate = rateRepository.save(rate);
        return updatedRate.getRateDto();
    }

    @Override
    public void deleteRate(Long rateId) {
        if (!rateRepository.existsById(rateId)) {
            throw new RuntimeException("Rate not found with id: " + rateId);
        }
        rateRepository.deleteById(rateId);
    }

    @Override
    public MaterialDto addMaterialToTask(Long taskId, MaterialDto materialDto) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Task not found with id: " + taskId));

        Material material = new Material();
        material.setName(materialDto.getName());
        material.setQuantity(materialDto.getQuantity());
        material.setTask(task);

        Material savedMaterial = materialRepository.save(material);
        return savedMaterial.getMaterialDto();
    }

    @Override
    public List<MaterialDto> getTaskMaterials(Long taskId) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Task not found with id: " + taskId));

        if (task.getMaterials() == null) {
            return List.of();
        }

        return task.getMaterials().stream()
                .map(Material::getMaterialDto)
                .collect(Collectors.toList());
    }

    @Override
    public MaterialDto updateMaterial(Long materialId, MaterialDto materialDto) {
        Material material = materialRepository.findById(materialId)
                .orElseThrow(() -> new RuntimeException("Material not found with id: " + materialId));

        material.setName(materialDto.getName());
        material.setQuantity(materialDto.getQuantity());

        Material updatedMaterial = materialRepository.save(material);
        return updatedMaterial.getMaterialDto();
    }

    @Override
    public void deleteMaterial(Long materialId) {
        if (!materialRepository.existsById(materialId)) {
            throw new RuntimeException("Material not found with id: " + materialId);
        }
        materialRepository.deleteById(materialId);
    }

    @Override
    public Double calculateTaskTotalPrice(Long taskId) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Task not found with id: " + taskId));

        if (task.getRates() == null || task.getRates().isEmpty()) {
            return 0.0;
        }

        // Prendre le tarif le plus récent ou le premier disponible
        return task.getRates().stream()
                .mapToDouble(Rate::getPrice)
                .min() // ou max() selon la logique métier
                .orElse(0.0);
    }

    @Override
    public List<TaskDto> searchTasksByName(String keyword) {
        return taskRepository.findAll()
                .stream()
                .filter(task -> task.getName().toLowerCase().contains(keyword.toLowerCase()))
                .map(Task::getTaskDto)
                .collect(Collectors.toList());
    }
}
