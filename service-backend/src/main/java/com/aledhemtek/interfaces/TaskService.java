package com.aledhemtek.interfaces;

import com.aledhemtek.dto.MaterialDto;
import com.aledhemtek.dto.RateDto;
import com.aledhemtek.dto.TaskDto;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface TaskService {

    /**
     * Récupérer toutes les tâches
     */
    List<TaskDto> getAllTasks();

    /**
     * Récupérer une tâche par ID
     */
    TaskDto getTaskById(Long taskId);

    /**
     * Récupérer les tâches par service
     */
    List<TaskDto> getTasksByService(Long serviceId);

    /**
     * Créer une nouvelle tâche
     */
    TaskDto createTask(TaskDto taskDto, MultipartFile file);

    /**
     * Mettre à jour une tâche
     */
    TaskDto updateTask(Long taskId, TaskDto taskDto);

    /**
     * Supprimer une tâche
     */
    void deleteTask(Long taskId);

    /**
     * Ajouter un tarif à une tâche
     */
    RateDto addRateToTask(Long taskId, RateDto rateDto);

    /**
     * Récupérer les tarifs d'une tâche
     */
    List<RateDto> getTaskRates(Long taskId);

    /**
     * Mettre à jour un tarif
     */
    RateDto updateRate(Long rateId, RateDto rateDto);

    /**
     * Supprimer un tarif
     */
    void deleteRate(Long rateId);

    /**
     * Ajouter un matériau à une tâche
     */
    MaterialDto addMaterialToTask(Long taskId, MaterialDto materialDto);

    /**
     * Récupérer les matériaux d'une tâche
     */
    List<MaterialDto> getTaskMaterials(Long taskId);

    /**
     * Mettre à jour un matériau
     */
    MaterialDto updateMaterial(Long materialId, MaterialDto materialDto);

    /**
     * Supprimer un matériau
     */
    void deleteMaterial(Long materialId);

    /**
     * Calculer le prix total d'une tâche
     */
    Double calculateTaskTotalPrice(Long taskId);

    /**
     * Rechercher des tâches par nom
     */
    List<TaskDto> searchTasksByName(String keyword);
}
