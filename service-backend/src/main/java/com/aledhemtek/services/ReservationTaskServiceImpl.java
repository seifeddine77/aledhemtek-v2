package com.aledhemtek.services;

import com.aledhemtek.dto.TaskDto;
import com.aledhemtek.interfaces.ReservationTaskService;
import com.aledhemtek.model.Reservation;
import com.aledhemtek.model.Task;
import com.aledhemtek.repositories.ReservationRepository;
import com.aledhemtek.repositories.TaskRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import com.aledhemtek.model.ReservationTask;
import java.time.LocalDateTime;

@Service
@Transactional
public class ReservationTaskServiceImpl implements ReservationTaskService {

    @Autowired
    private ReservationRepository reservationRepository;

    @Autowired
    private TaskRepository taskRepository;

    @Override
    public TaskDto addTaskToReservation(Long reservationId, TaskDto taskDto) {
        Reservation reservation = reservationRepository.findById(reservationId)
                .orElseThrow(() -> new RuntimeException("Reservation not found with id: " + reservationId));

        Task task = new Task();
        task.setName(taskDto.getName());
        task.setDescription(taskDto.getDescription());
        task.setDuration(taskDto.getDuration());
        task.setImageName(taskDto.getImageName());
        task.setReservation(reservation);

        Task savedTask = taskRepository.save(task);
        return savedTask.getTaskDto();
    }

    @Override
    public List<TaskDto> addTasksToReservation(Long reservationId, List<TaskDto> taskDtos) {
        Reservation reservation = reservationRepository.findById(reservationId)
                .orElseThrow(() -> new RuntimeException("Reservation not found with id: " + reservationId));

        List<Task> tasks = taskDtos.stream().map(taskDto -> {
            Task task = new Task();
            task.setName(taskDto.getName());
            task.setDescription(taskDto.getDescription());
            task.setDuration(taskDto.getDuration());
            task.setImageName(taskDto.getImageName());
            task.setReservation(reservation);
            return task;
        }).collect(Collectors.toList());

        List<Task> savedTasks = taskRepository.saveAll(tasks);
        return savedTasks.stream()
                .map(Task::getTaskDto)
                .collect(Collectors.toList());
    }

    @Override
    public List<TaskDto> getReservationTasks(Long reservationId) {
        Reservation reservation = reservationRepository.findById(reservationId)
                .orElseThrow(() -> new RuntimeException("Reservation not found with id: " + reservationId));

        if (reservation.getTasks() == null) {
            return List.of();
        }

        return reservation.getTasks().stream()
                .map(Task::getTaskDto)
                .collect(Collectors.toList());
    }

    @Override
    public TaskDto updateReservationTask(Long reservationId, Long taskId, TaskDto taskDto) {
        // Vérifier que la réservation existe
        reservationRepository.findById(reservationId)
                .orElseThrow(() -> new RuntimeException("Reservation not found with id: " + reservationId));

        // Vérifier que la tâche existe et appartient à cette réservation
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Task not found with id: " + taskId));

        if (!task.getReservation().getId().equals(reservationId)) {
            throw new RuntimeException("Task does not belong to this reservation");
        }

        // Mettre à jour la tâche
        task.setName(taskDto.getName());
        task.setDescription(taskDto.getDescription());
        task.setDuration(taskDto.getDuration());

        Task updatedTask = taskRepository.save(task);
        return updatedTask.getTaskDto();
    }

    @Override
    public void removeTaskFromReservation(Long reservationId, Long taskId) {
        // Vérifier que la réservation existe
        reservationRepository.findById(reservationId)
                .orElseThrow(() -> new RuntimeException("Reservation not found with id: " + reservationId));

        // Vérifier que la tâche existe et appartient à cette réservation
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Task not found with id: " + taskId));

        if (!task.getReservation().getId().equals(reservationId)) {
            throw new RuntimeException("Task does not belong to this reservation");
        }

        // Supprimer la tâche
        taskRepository.deleteById(taskId);
    }

    @Override
    public Double calculateReservationTotalPrice(Long reservationId) {
        Reservation reservation = reservationRepository.findById(reservationId)
                .orElseThrow(() -> new RuntimeException("Reservation not found with id: " + reservationId));

        if (reservation.getTasks() == null || reservation.getTasks().isEmpty()) {
            return 0.0;
        }

        return reservation.getTasks().stream()
                .mapToDouble(task -> {
                    if (task.getRates() != null && !task.getRates().isEmpty()) {
                        // Prendre le prix minimum de chaque tâche
                        return task.getRates().stream()
                                .mapToDouble(rate -> rate.getPrice())
                                .min()
                                .orElse(0.0);
                    }
                    return 0.0;
                })
                .sum();
    }

    @Override
    public Integer calculateReservationTotalDuration(Long reservationId) {
        Reservation reservation = reservationRepository.findById(reservationId)
                .orElseThrow(() -> new RuntimeException("Reservation not found with id: " + reservationId));

        if (reservation.getTasks() == null || reservation.getTasks().isEmpty()) {
            return 0;
        }

        return reservation.getTasks().stream()
                .mapToInt(task -> task.getDuration() != null ? task.getDuration() : 0)
                .sum();
    }

    @Override
    public TaskDto markTaskAsCompleted(Long reservationId, Long taskId) {
        // Vérifier que la réservation existe
        reservationRepository.findById(reservationId)
                .orElseThrow(() -> new RuntimeException("Reservation not found with id: " + reservationId));

        // Vérifier que la tâche existe et appartient à cette réservation
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Task not found with id: " + taskId));

        if (!task.getReservation().getId().equals(reservationId)) {
            throw new RuntimeException("Task does not belong to this reservation");
        }

        // Pour l'instant, on peut ajouter un champ "completed" à la tâche
        // ou utiliser un autre mécanisme pour marquer comme terminé
        // Ici, on va juste retourner la tâche (à améliorer selon les besoins)

        Task updatedTask = taskRepository.save(task);
        return updatedTask.getTaskDto();
    }

    @Override
    public List<TaskDto> getPendingTasks(Long reservationId) {
        Reservation reservation = reservationRepository.findById(reservationId)
                .orElseThrow(() -> new RuntimeException("Reservation not found with id: " + reservationId));

        if (reservation.getTasks() == null) {
            return List.of();
        }

        // Pour l'instant, on retourne toutes les tâches
        // À améliorer avec un système de statut des tâches
        return reservation.getTasks().stream()
                .map(Task::getTaskDto)
                .collect(Collectors.toList());
    }

    @Override
    public List<TaskDto> getCompletedTasks(Long reservationId) {
        reservationRepository.findById(reservationId)
                .orElseThrow(() -> new RuntimeException("Reservation not found with id: " + reservationId));

        // Pour l'instant, on retourne une liste vide
        // À améliorer avec un système de statut des tâches
        return List.of();
    }

    @Override
    public List<TaskDto> addTasksWithQuantitiesToReservation(Long reservationId, List<Long> taskIds, Map<String, Integer> taskQuantities) {
        Reservation reservation = reservationRepository.findById(reservationId)
                .orElseThrow(() -> new RuntimeException("Reservation not found with id: " + reservationId));

        List<TaskDto> addedTasks = new java.util.ArrayList<>();
        
        if (taskIds != null && !taskIds.isEmpty()) {
            for (Long taskId : taskIds) {
                Task catalogTask = taskRepository.findById(taskId)
                        .orElseThrow(() -> new RuntimeException("Task not found: " + taskId));
                
                // Vérifier si la tâche existe déjà dans la réservation
                boolean taskExists = reservation.getReservationTasks().stream()
                        .anyMatch(rt -> rt.getTask().getId().equals(taskId));
                
                if (!taskExists) {
                    ReservationTask reservationTask = new ReservationTask();
                    reservationTask.setReservation(reservation);
                    reservationTask.setTask(catalogTask);
                    
                    String taskIdStr = taskId.toString();
                    int quantity = (taskQuantities != null && taskQuantities.containsKey(taskIdStr)) 
                            ? taskQuantities.get(taskIdStr) : 1;
                    reservationTask.setQuantity(quantity);
                    
                    // Calculer le prix unitaire (logique simplifiée)
                    double unitPrice = catalogTask.getRates() != null && !catalogTask.getRates().isEmpty() 
                            ? catalogTask.getRates().stream().mapToDouble(rate -> rate.getPrice()).min().orElse(0.0)
                            : 0.0;
                    reservationTask.setUnitPrice(unitPrice);
                    reservationTask.calculateTotalPrice();
                    
                    reservation.getReservationTasks().add(reservationTask);
                    
                    // Créer le TaskDto avec la quantité
                    TaskDto taskDto = catalogTask.getTaskDto();
                    taskDto.setQuantity(quantity);
                    addedTasks.add(taskDto);
                }
            }
        }
        
        reservation.setUpdatedAt(LocalDateTime.now());
        reservationRepository.save(reservation);
        
        return addedTasks;
    }

    @Override
    public TaskDto updateTaskQuantity(Long reservationId, Long taskId, Integer quantity) {
        Reservation reservation = reservationRepository.findById(reservationId)
                .orElseThrow(() -> new RuntimeException("Reservation not found with id: " + reservationId));
        
        ReservationTask reservationTask = reservation.getReservationTasks().stream()
                .filter(rt -> rt.getTask().getId().equals(taskId))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Task not found in reservation"));
        
        reservationTask.setQuantity(quantity);
        reservationTask.calculateTotalPrice();
        
        reservation.setUpdatedAt(LocalDateTime.now());
        reservationRepository.save(reservation);
        
        TaskDto taskDto = reservationTask.getTask().getTaskDto();
        taskDto.setQuantity(quantity);
        return taskDto;
    }
}
