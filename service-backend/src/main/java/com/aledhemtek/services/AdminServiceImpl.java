package com.aledhemtek.services;

import com.aledhemtek.dto.MaterialDto;
import com.aledhemtek.dto.ServiceDto;
import com.aledhemtek.dto.TaskDto;
import com.aledhemtek.model.*;
import com.aledhemtek.repositories.CategoryRepository;
import com.aledhemtek.repositories.MaterialRepository;
import com.aledhemtek.repositories.ServiceRepository;
import com.aledhemtek.repositories.TaskRepository;
import com.aledhemtek.interfaces.AdminService;
import com.aledhemtek.interfaces.StorageService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.stream.Collectors;

@org.springframework.stereotype.Service
public class AdminServiceImpl implements AdminService {

    @Autowired
    private ServiceRepository serviceRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private StorageService storageService;

    @Autowired
    private TaskRepository taskRepository;

    @Autowired
    private MaterialRepository materialRepository;


    @Override
    public ServiceDto createService(ServiceDto serviceDto, MultipartFile file) {
        Category category = categoryRepository.findById(serviceDto.getCategoryId())
                .orElseThrow(() -> new RuntimeException("Category not found"));
        String imageName = storageService.store(file, "services");

        Service service = new Service();
        service.setName(serviceDto.getName());
        service.setDescription(serviceDto.getDescription());
        service.setImg(imageName);
        service.setCategory(category);

        Service savedService = serviceRepository.save(service);
        return toDto(savedService);
    }

    @Override
    public List<ServiceDto> getAllServices() {
        return serviceRepository.findAll().stream().map(this::toDto).collect(Collectors.toList());
    }

    @Override
    public TaskDto createTask(TaskDto taskDto, MultipartFile file) {
        try {

            Service service = serviceRepository.findById(taskDto.getServiceId())
                    .orElseThrow(() -> new RuntimeException("Service not found with id: " + taskDto.getServiceId()));

            String imageName = storageService.store(file, "tasks");

            Task task = new Task();
            task.setName(taskDto.getName());
            task.setDescription(taskDto.getDescription());
            task.setDuration(taskDto.getDuration());
            task.setImageName(imageName);
            task.setService(service);

            if (taskDto.getRates() != null && !taskDto.getRates().isEmpty()) {
                List<Rate> rates = taskDto.getRates().stream().map(rateDto -> {
                    Rate rate = new Rate();
                    rate.setPrice(rateDto.getPrice());
                    rate.setStartDate(rateDto.getStartDate());
                    rate.setEndDate(rateDto.getEndDate());
                    rate.setTask(task); // Lier le tarif à la tâche
                    return rate;
                }).collect(Collectors.toList());
                task.setRates(rates);
            }

            if (taskDto.getMaterials() != null && !taskDto.getMaterials().isEmpty()) {
                List<Material> materials = taskDto.getMaterials().stream().map(materialDto -> {
                    Material material = new Material();
                    material.setName(materialDto.getName());
                    material.setQuantity(materialDto.getQuantity());
                    material.setTask(task); // Link back to the task
                    return material;
                }).collect(Collectors.toList());
                task.setMaterials(materials);
            }

            Task savedTask = taskRepository.save(task);
            return savedTask.getTaskDto();
        } catch (Exception e) {
            throw new RuntimeException("Failed to create task: " + e.getMessage(), e);
        }
    }

    @Override
    public List<TaskDto> getAllTasks() {
        return taskRepository.findAll()
                .stream()
                .map(Task::getTaskDto)
                .collect(Collectors.toList());
    }

    @Override
    public void deleteTask(Long taskId) {
        if (!taskRepository.existsById(taskId)) {
            throw new RuntimeException("Task not found with id: " + taskId);
        }
        taskRepository.deleteById(taskId);
    }

    @Override
    public TaskDto updateTask(Long taskId, TaskDto taskDto) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Task not found with id: " + taskId));

        task.setName(taskDto.getName());
        task.setDescription(taskDto.getDescription());
        task.setDuration(taskDto.getDuration());

        // Gérer la mise à jour du prix
        if (taskDto.getPrice() != null) {
            if (task.getRates() != null && !task.getRates().isEmpty()) {
                task.getRates().get(0).setPrice(taskDto.getPrice());
            } else {
                Rate newRate = new Rate();
                newRate.setPrice(taskDto.getPrice());
                task.setRates(List.of(newRate));
            }
        }

        Task updatedTask = taskRepository.save(task);
        return updatedTask.getTaskDto();
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

    private ServiceDto toDto(Service service) {
        ServiceDto dto = new ServiceDto();
        dto.setId(service.getId());
        dto.setName(service.getName());
        dto.setDescription(service.getDescription());
        dto.setImg(service.getImg());
        dto.setCategoryId(service.getCategory().getId());
        dto.setCategoryName(service.getCategory().getName());
        if (service.getTasks() != null) {
            dto.setTasks(service.getTasks().stream().map(Task::getTaskDto).collect(Collectors.toList()));
        }
        return dto;
    }

}
