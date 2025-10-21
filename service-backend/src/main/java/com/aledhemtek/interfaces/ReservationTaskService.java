package com.aledhemtek.interfaces;

import com.aledhemtek.dto.TaskDto;

import java.util.List;

public interface ReservationTaskService {

    /**
     * Ajouter une tâche à une réservation
     */
    TaskDto addTaskToReservation(Long reservationId, TaskDto taskDto);

    /**
     * Ajouter plusieurs tâches à une réservation
     */
    List<TaskDto> addTasksToReservation(Long reservationId, List<TaskDto> taskDtos);

    /**
     * Ajouter des tâches avec quantités à une réservation
     */
    List<TaskDto> addTasksWithQuantitiesToReservation(Long reservationId, List<Long> taskIds, java.util.Map<String, Integer> taskQuantities);

    /**
     * Récupérer toutes les tâches d'une réservation
     */
    List<TaskDto> getReservationTasks(Long reservationId);

    /**
     * Mettre à jour une tâche dans une réservation
     */
    TaskDto updateReservationTask(Long reservationId, Long taskId, TaskDto taskDto);

    /**
     * Supprimer une tâche d'une réservation
     */
    void removeTaskFromReservation(Long reservationId, Long taskId);

    /**
     * Mettre à jour la quantité d'une tâche dans une réservation
     */
    TaskDto updateTaskQuantity(Long reservationId, Long taskId, Integer quantity);

    /**
     * Calculer le prix total des tâches d'une réservation
     */
    Double calculateReservationTotalPrice(Long reservationId);

    /**
     * Calculer la durée totale des tâches d'une réservation
     */
    Integer calculateReservationTotalDuration(Long reservationId);

    /**
     * Marquer une tâche comme terminée
     */
    TaskDto markTaskAsCompleted(Long reservationId, Long taskId);

    /**
     * Récupérer les tâches non terminées d'une réservation
     */
    List<TaskDto> getPendingTasks(Long reservationId);

    /**
     * Récupérer les tâches terminées d'une réservation
     */
    List<TaskDto> getCompletedTasks(Long reservationId);
}
