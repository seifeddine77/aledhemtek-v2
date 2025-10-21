package com.aledhemtek.interfaces;

import com.aledhemtek.dto.MaterialDto;
import com.aledhemtek.dto.ServiceDto;
import com.aledhemtek.dto.TaskDto;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface AdminService {

    ServiceDto createService(ServiceDto serviceDto, MultipartFile file);

    List<ServiceDto> getAllServices();

    TaskDto createTask(TaskDto taskDto, MultipartFile file);

    List<TaskDto> getAllTasks();

    void deleteTask(Long taskId);

    TaskDto updateTask(Long taskId, TaskDto taskDto);

    // Méthodes pour les matériaux
    MaterialDto addMaterialToTask(Long taskId, MaterialDto materialDto);

    MaterialDto updateMaterial(Long materialId, MaterialDto materialDto);

    void deleteMaterial(Long materialId);

}
