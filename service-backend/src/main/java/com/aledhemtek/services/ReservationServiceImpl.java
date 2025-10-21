package com.aledhemtek.services;

import com.aledhemtek.dto.ReservationDto;
import com.aledhemtek.interfaces.ReservationService;
import com.aledhemtek.model.*;
import com.aledhemtek.repositories.*;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import java.util.ArrayList;

@Service
@RequiredArgsConstructor
@Transactional
public class ReservationServiceImpl implements ReservationService {

    private final ReservationRepository reservationRepository;
    private final ClientRepository clientRepository;
    private final ConsultantRepository consultantRepository;
    private final TaskRepository taskRepository;
    
    @Autowired
    private AutoInvoiceService autoInvoiceService;

    @Override
    public ReservationDto createReservation(ReservationDto reservationDto) {
        Reservation reservation = new Reservation();
        mapDtoToEntity(reservationDto, reservation);
        
        // Set client
        if (reservationDto.getClientId() != null) {
            Client client = clientRepository.findById(reservationDto.getClientId())
                .orElseThrow(() -> new RuntimeException("Client not found"));
            reservation.setClient(client);
        }
        
        reservation.setCreatedAt(LocalDateTime.now());
        reservation.setUpdatedAt(LocalDateTime.now());
        
        if (reservationDto.getTasks() != null && !reservationDto.getTasks().isEmpty()) {
            List<ReservationTask> reservationTasks = new ArrayList<>();
            
            for (var taskDto : reservationDto.getTasks()) {
                if (taskDto.getId() != null) {
                    // Référencer une tâche existante du catalogue (pas de copie)
                    Task catalogTask = taskRepository.findById(taskDto.getId())
                        .orElseThrow(() -> new RuntimeException("Task not found: " + taskDto.getId()));
                    
                    // Créer une liaison ReservationTask au lieu de copier la tâche
                    ReservationTask reservationTask = new ReservationTask();
                    reservationTask.setReservation(reservation);
                    reservationTask.setTask(catalogTask); // Référence vers la tâche du catalogue
                    reservationTask.setQuantity(taskDto.getQuantity() != null ? taskDto.getQuantity() : 1);
                    
                    // Calculer le prix unitaire actuel de la tâche
                    double unitPrice = getTaskCurrentPrice(catalogTask);
                    reservationTask.setUnitPrice(unitPrice);
                    reservationTask.calculateTotalPrice(); // Calcule quantity * unitPrice
                    
                    reservationTasks.add(reservationTask);
                }
            }
            
            reservation.setReservationTasks(reservationTasks);
            

        }

        updateTotalPrice(reservation);
        Reservation savedReservation = reservationRepository.save(reservation);
        return savedReservation.getReservationDto();
    }

    @Override
    public ReservationDto updateReservation(Long id, ReservationDto reservationDto) {
        Reservation reservation = reservationRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Reservation not found"));

        mapDtoToEntity(reservationDto, reservation);
        reservation.setUpdatedAt(LocalDateTime.now());

        // Synchronize the tasks collection
        // 1. Clear the existing collection. Thanks to orphanRemoval=true, JPA will delete tasks that are removed from this list.
        if (reservation.getTasks() != null) {
            reservation.getTasks().clear();
        }

        // 2. Repopulate the collection from the DTO
        if (reservationDto.getTasks() != null && !reservationDto.getTasks().isEmpty()) {
            List<Task> taskEntities = new ArrayList<>();
            
            for (var taskDto : reservationDto.getTasks()) {
                if (taskDto.getId() != null) {
                    // Utiliser une tâche existante du catalogue
                    Task catalogTask = taskRepository.findById(taskDto.getId())
                        .orElseThrow(() -> new RuntimeException("Task not found: " + taskDto.getId()));
                    
                    // Créer une copie de la tâche pour cette réservation
                    Task reservationTask = createTaskCopy(catalogTask, reservation);
                    taskEntities.add(reservationTask);
                } else {
                    // Fallback: créer une tâche personnalisée
                    Task customTask = new Task();
                    customTask.setName(taskDto.getName());
                    customTask.setDescription(taskDto.getDescription());
                    customTask.setDuration(taskDto.getDuration());
                    customTask.setReservation(reservation);
                    taskEntities.add(customTask);
                }
            }
            
            reservation.getTasks().addAll(taskEntities);
            
            // Recalculer le prix total
            updateTotalPrice(reservation);
        }

        Reservation updatedReservation = reservationRepository.save(reservation);
        return updatedReservation.getReservationDto();
    }

    @Override
    public void deleteReservation(Long id) {
        if (!reservationRepository.existsById(id)) {
            throw new RuntimeException("Reservation not found");
        }
        reservationRepository.deleteById(id);
    }

    @Override
    @Transactional(readOnly = true)
    public ReservationDto getReservationById(Long id) {
        Reservation reservation = reservationRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Reservation not found"));
        return reservation.getReservationDto();
    }

    @Override
    @Transactional(readOnly = true)
    public List<ReservationDto> getAllReservations() {
        return reservationRepository.findAll().stream()
            .map(Reservation::getReservationDto)
            .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<ReservationDto> getReservationsByConsultant(Long consultantId) {
        return reservationRepository.findByConsultantId(consultantId).stream()
            .map(Reservation::getReservationDto)
            .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<ReservationDto> getReservationsByClient(Long clientId) {
        System.out.println("[DEBUG] Searching reservations for client ID: " + clientId);
        List<Reservation> reservations = reservationRepository.findByClientId(clientId);
        System.out.println("[DEBUG] Found " + reservations.size() + " reservations in database");
        
        for (Reservation reservation : reservations) {
            System.out.println("[DEBUG] Reservation: ID=" + reservation.getId() + 
                ", Title=" + reservation.getTitle() + 
                ", ClientID=" + (reservation.getClient() != null ? reservation.getClient().getId() : "null") +
                ", Status=" + reservation.getStatus());
        }
        
        return reservations.stream()
            .map(Reservation::getReservationDto)
            .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<ReservationDto> getReservationsByStatus(Reservation.ReservationStatus status) {
        return reservationRepository.findByStatus(status).stream()
            .map(Reservation::getReservationDto)
            .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<ReservationDto> getReservationsByDateRange(LocalDateTime startDate, LocalDateTime endDate) {
        return reservationRepository.findByDateRange(startDate, endDate).stream()
            .map(Reservation::getReservationDto)
            .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<ReservationDto> getConsultantCalendar(Long consultantId, LocalDateTime startDate, LocalDateTime endDate) {
        return reservationRepository.findByConsultantAndDateRange(consultantId, startDate, endDate).stream()
            .map(Reservation::getReservationDto)
            .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<ReservationDto> getUnassignedReservations() {
        return reservationRepository.findUnassignedReservations().stream()
            .map(Reservation::getReservationDto)
            .collect(Collectors.toList());
    }

    @Override
    public ReservationDto assignConsultantToReservation(Long reservationId, Long consultantId) {
        Reservation reservation = reservationRepository.findById(reservationId)
            .orElseThrow(() -> new RuntimeException("Reservation not found"));
        
        Consultant consultant = consultantRepository.findById(consultantId)
            .orElseThrow(() -> new RuntimeException("Consultant not found"));
        
        // Check if consultant is available
        if (!isConsultantAvailable(consultantId, reservation.getStartDate(), reservation.getEndDate())) {
            throw new RuntimeException("Consultant is not available for this time slot");
        }
        
        reservation.setConsultant(consultant);
        reservation.setStatus(Reservation.ReservationStatus.ASSIGNED);
        reservation.setUpdatedAt(LocalDateTime.now());
        
        Reservation updatedReservation = reservationRepository.save(reservation);
        return updatedReservation.getReservationDto();
    }

    @Override
    public ReservationDto updateReservationStatus(Long reservationId, Reservation.ReservationStatus status) {
        System.out.println("[DEBUG] updateReservationStatus called - ID: " + reservationId + ", Status: " + status);
        
        Reservation reservation = reservationRepository.findById(reservationId)
            .orElseThrow(() -> new RuntimeException("Reservation not found"));
        
        Reservation.ReservationStatus oldStatus = reservation.getStatus();
        System.out.println("[DEBUG] Old status: " + oldStatus + ", New status: " + status);
        
        reservation.setStatus(status);
        reservation.setUpdatedAt(LocalDateTime.now());
        
        Reservation updatedReservation = reservationRepository.save(reservation);
        System.out.println("[DEBUG] Reservation status updated successfully");
        
        // Déclencher la génération automatique de facture si la réservation passe à COMPLETED
        if (status == Reservation.ReservationStatus.COMPLETED && oldStatus != Reservation.ReservationStatus.COMPLETED) {
            System.out.println("[DEBUG] Triggering automatic invoice generation for reservation " + reservationId);
            try {
                autoInvoiceService.generateInvoiceForCompletedReservation(reservationId);
                System.out.println("[DEBUG] Invoice generation triggered successfully");
            } catch (Exception e) {
                System.err.println("[ERROR] Failed to trigger invoice generation: " + e.getMessage());
                e.printStackTrace();
            }
        } else {
            System.out.println("[DEBUG] No invoice generation needed - Status: " + status + ", OldStatus: " + oldStatus);
        }
        
        return updatedReservation.getReservationDto();
    }

    @Override
    @Transactional(readOnly = true)
    public boolean isConsultantAvailable(Long consultantId, LocalDateTime startDate, LocalDateTime endDate) {
        Long conflictingReservations = reservationRepository.countConflictingReservations(
            consultantId, startDate, endDate);
        return conflictingReservations == 0;
    }

    private void mapDtoToEntity(ReservationDto dto, Reservation entity) {
        entity.setStartDate(dto.getStartDate());
        entity.setEndDate(dto.getEndDate());
        entity.setTitle(dto.getTitle());
        entity.setDescription(dto.getDescription());
        if (dto.getStatus() != null) {
            entity.setStatus(dto.getStatus());
        }
        
        // Mapper les données de géolocalisation
        entity.setLatitude(dto.getLatitude());
        entity.setLongitude(dto.getLongitude());
        entity.setAddress(dto.getAddress());
    }
    
    /**
     * Crée une copie d'une tâche du catalogue pour une réservation spécifique
     */
    private Task createTaskCopy(Task catalogTask, Reservation reservation) {
        Task reservationTask = new Task();
        reservationTask.setName(catalogTask.getName());
        reservationTask.setDescription(catalogTask.getDescription());
        reservationTask.setDuration(catalogTask.getDuration());
        reservationTask.setImageName(catalogTask.getImageName());
        reservationTask.setService(catalogTask.getService());
        reservationTask.setReservation(reservation);
        
        // Copier les tarifs
        if (catalogTask.getRates() != null && !catalogTask.getRates().isEmpty()) {
            List<Rate> taskRates = new ArrayList<>();
            for (Rate catalogRate : catalogTask.getRates()) {
                Rate newRate = new Rate();
                newRate.setPrice(catalogRate.getPrice());
                newRate.setStartDate(catalogRate.getStartDate());
                newRate.setEndDate(catalogRate.getEndDate());
                taskRates.add(newRate);
            }
            reservationTask.setRates(taskRates);
        }
        
        // Copier les matériaux
        if (catalogTask.getMaterials() != null && !catalogTask.getMaterials().isEmpty()) {
            List<Material> taskMaterials = new ArrayList<>();
            for (Material catalogMaterial : catalogTask.getMaterials()) {
                Material newMaterial = new Material();
                newMaterial.setName(catalogMaterial.getName());
                newMaterial.setQuantity(catalogMaterial.getQuantity());
                newMaterial.setTask(reservationTask);
                taskMaterials.add(newMaterial);
            }
            reservationTask.setMaterials(taskMaterials);
        }
        
        return reservationTask;
    }
    
    /**
     * Calcule le prix total d'une réservation basé sur ses tâches
     */
    public Double calculateReservationTotalPrice(Long reservationId) {
        Reservation reservation = reservationRepository.findById(reservationId)
            .orElseThrow(() -> new RuntimeException("Reservation not found"));
        
        return calculateTasksTotalPrice(reservation.getTasks());
    }
    
    /**
     * Calcule le prix total d'une liste de tâches
     */
    public Double calculateTasksTotalPrice(List<Task> tasks) {
        if (tasks == null || tasks.isEmpty()) {
            return 0.0;
        }
        
        return tasks.stream()
            .mapToDouble(this::getTaskCurrentPrice)
            .sum();
    }
    
    @Override
    public ReservationDto addTasksToReservation(Long reservationId, List<Long> taskIds, Map<String, Integer> taskQuantities) {
        Reservation reservation = reservationRepository.findById(reservationId)
            .orElseThrow(() -> new RuntimeException("Reservation not found"));
        
        if (taskIds != null && !taskIds.isEmpty()) {
            for (Long taskId : taskIds) {
                Task catalogTask = taskRepository.findById(taskId)
                    .orElseThrow(() -> new RuntimeException("Task not found: " + taskId));
                
                // Vérifier si la tâche n'est pas déjà dans la réservation
                boolean taskExists = reservation.getReservationTasks().stream()
                    .anyMatch(rt -> rt.getTask().getId().equals(taskId));
                
                if (!taskExists) {
                    // Créer une nouvelle ReservationTask
                    ReservationTask reservationTask = new ReservationTask();
                    reservationTask.setReservation(reservation);
                    reservationTask.setTask(catalogTask);
                    
                    // Définir la quantité
                    String taskIdStr = taskId.toString();
                    int quantity = (taskQuantities != null && taskQuantities.containsKey(taskIdStr)) 
                        ? taskQuantities.get(taskIdStr) : 1;
                    reservationTask.setQuantity(quantity);
                    
                    // Calculer le prix unitaire actuel de la tâche
                    double unitPrice = getTaskCurrentPrice(catalogTask);
                    reservationTask.setUnitPrice(unitPrice);
                    reservationTask.calculateTotalPrice();
                    
                    reservation.getReservationTasks().add(reservationTask);
                }
            }
        }
        
        // Recalculer le prix total
        updateTotalPrice(reservation);
        reservation.setUpdatedAt(LocalDateTime.now());
        
        Reservation updatedReservation = reservationRepository.save(reservation);
        return updatedReservation.getReservationDto();
    }
    
    @Override
    public ReservationDto removeTaskFromReservation(Long reservationId, Long taskId) {
        Reservation reservation = reservationRepository.findById(reservationId)
            .orElseThrow(() -> new RuntimeException("Reservation not found"));
        
        // Supprimer la ReservationTask correspondante
        reservation.getReservationTasks().removeIf(rt -> rt.getTask().getId().equals(taskId));
        
        // Recalculer le prix total
        updateTotalPrice(reservation);
        reservation.setUpdatedAt(LocalDateTime.now());
        
        Reservation updatedReservation = reservationRepository.save(reservation);
        return updatedReservation.getReservationDto();
    }
    
    @Override
    public ReservationDto updateReservationTaskQuantity(Long reservationId, Long taskId, Integer quantity) {
        Reservation reservation = reservationRepository.findById(reservationId)
            .orElseThrow(() -> new RuntimeException("Reservation not found"));
        
        // Trouver la ReservationTask correspondante
        ReservationTask reservationTask = reservation.getReservationTasks().stream()
            .filter(rt -> rt.getTask().getId().equals(taskId))
            .findFirst()
            .orElseThrow(() -> new RuntimeException("Task not found in reservation"));
        
        // Mettre à jour la quantité
        reservationTask.setQuantity(quantity);
        reservationTask.calculateTotalPrice(); // Recalculer le prix total de cette tâche
        
        // Recalculer le prix total de la réservation
        updateTotalPrice(reservation);
        reservation.setUpdatedAt(LocalDateTime.now());
        
        Reservation updatedReservation = reservationRepository.save(reservation);
        return updatedReservation.getReservationDto();
    }
    
    /**
     * Récupère le prix actuel d'une tâche (somme de tous les tarifs valides + matériaux)
     */
    private Double getTaskCurrentPrice(Task task) {
        if (task == null) {
            System.out.println("[PRICE DEBUG] Task is null");
            return 0.0;
        }
        
        System.out.println("[PRICE DEBUG] Task ID: " + task.getId() + ", Name: " + task.getName());
        
        LocalDateTime now = LocalDateTime.now();
        System.out.println("[PRICE DEBUG] Current time: " + now);
        
        // Calculer le prix des tarifs (rates) valides
        double ratesPrice = 0.0;
        if (task.getRates() != null && !task.getRates().isEmpty()) {
            System.out.println("[PRICE DEBUG] Task has " + task.getRates().size() + " rates");
            
            for (Rate rate : task.getRates()) {
                System.out.println("[PRICE DEBUG] Rate ID: " + rate.getId() + 
                                 ", Price: " + rate.getPrice() + 
                                 ", Start: " + rate.getStartDate() + 
                                 ", End: " + rate.getEndDate() + 
                                 ", Valid: " + isRateValid(rate, now));
            }
            
            // Prendre le tarif valide le plus récent (ou le premier si pas de date de début)
            ratesPrice = task.getRates().stream()
                .filter(rate -> isRateValid(rate, now))
                .mapToDouble(Rate::getPrice)
                .min() // Prendre le prix minimum parmi les tarifs valides
                .orElse(0.0);
                
            System.out.println("[PRICE DEBUG] Calculated rates price: " + ratesPrice);
        } else {
            System.out.println("[PRICE DEBUG] Task has no rates or rates is null");
        }
        
        // Calculer le prix des matériaux
        double materialsPrice = 0.0;
        if (task.getMaterials() != null && !task.getMaterials().isEmpty()) {
            materialsPrice = task.getMaterials().stream()
                .mapToDouble(material -> {
                    // Prix unitaire * quantité (si le matériau a un prix)
                    // Pour l'instant, on considère que les matériaux n'ont pas de prix unitaire
                    // mais on peut l'ajouter plus tard
                    return 0.0; // À implémenter si nécessaire
                })
                .sum();
        }
        
        double totalPrice = ratesPrice + materialsPrice;
        System.out.println("[PRICE CALC] Task ID: " + task.getId() + ", Rates: " + ratesPrice + ", Materials: " + materialsPrice + ", Total: " + totalPrice);
        
        return totalPrice;
    }
    
    /**
     * Vérifie si un tarif est valide à une date donnée
     * Logique améliorée: accepte les rates sans dates ou avec dates valides
     */
    private boolean isRateValid(Rate rate, LocalDateTime date) {
        if (rate == null) {
            return false;
        }
        
        // Si pas de dates définies, le rate est toujours valide
        if (rate.getStartDate() == null && rate.getEndDate() == null) {
            System.out.println("[RATE VALIDATION] Rate ID: " + rate.getId() + 
                             ", Price: " + rate.getPrice() + 
                             ", No dates defined - VALID");
            return true;
        }
        
        LocalDate currentDate = date.toLocalDate();
        
        // Vérifier la date de début
        boolean afterStart = rate.getStartDate() == null || 
            !currentDate.isBefore(rate.getStartDate());
            
        // Vérifier la date de fin
        boolean beforeEnd = rate.getEndDate() == null || 
            !currentDate.isAfter(rate.getEndDate());
        
        boolean isValid = afterStart && beforeEnd;
        
        System.out.println("[RATE VALIDATION] Rate ID: " + rate.getId() + 
                         ", Price: " + rate.getPrice() + 
                         ", Current: " + currentDate + 
                         ", Start: " + rate.getStartDate() + 
                         ", End: " + rate.getEndDate() + 
                         ", Valid: " + isValid);
        
        return isValid;
    }
    
    private void updateTotalPrice(Reservation reservation) {
        if (reservation == null) return;
        
        double totalPrice = 0.0;
        if (reservation.getReservationTasks() != null) {
            totalPrice = reservation.getReservationTasks().stream()
                .mapToDouble(rt -> rt.getTotalPrice() != null ? rt.getTotalPrice() : 0.0)
                .sum();
        }
        
        reservation.setTotalPrice(totalPrice);
    }

    /**
     * Calcule le prix total d'une liste de tâches à partir de leurs IDs
     */
    @Override
    @Transactional(readOnly = true)
    public Double calculateTasksTotalPriceByIds(List<Long> taskIds) {
        if (taskIds == null || taskIds.isEmpty()) {
            return 0.0;
        }
        
        List<Task> tasks = taskRepository.findAllById(taskIds);
        return calculateTasksTotalPrice(tasks);
    }
    
    @Override
    @Transactional(readOnly = true)
    public Double calculateTaskPrice(Task task) {
        return getTaskCurrentPrice(task);
    }
    
    @Override
    @Transactional(readOnly = true)
    public Double calculateTasksTotalPriceWithQuantities(List<Long> taskIds, Map<String, Integer> taskQuantities) {
        if (taskIds == null || taskIds.isEmpty()) {
            return 0.0;
        }
        
        // Charger les tâches avec leurs rates
        List<Task> tasks = taskRepository.findAllByIdWithRates(taskIds);
        System.out.println("[PRICE DEBUG] Loaded " + tasks.size() + " tasks with rates");
        double totalPrice = 0.0;
        
        for (Task task : tasks) {
            double taskPrice = getTaskCurrentPrice(task);
            
            // Récupérer la quantité pour cette tâche
            String taskIdStr = task.getId().toString();
            int quantity = 1; // Quantité par défaut
            
            if (taskQuantities != null && taskQuantities.containsKey(taskIdStr)) {
                quantity = taskQuantities.get(taskIdStr);
            }
            
            double taskTotalPrice = taskPrice * quantity;
            totalPrice += taskTotalPrice;
            
            System.out.println("[PRICE CALC WITH QTY] Task ID: " + task.getId() + 
                             ", Unit Price: " + taskPrice + 
                             ", Quantity: " + quantity + 
                             ", Total: " + taskTotalPrice);
        }
        
        System.out.println("[TOTAL PRICE WITH QTY] Final Total: " + totalPrice);
        return totalPrice;
    }
    
    /**
     * Calcule le prix d'une tâche selon différentes stratégies
     */
    @SuppressWarnings("unused")
    private double calculateTaskPriceWithStrategy(Task task, String strategy) {
        LocalDateTime now = LocalDateTime.now();
        
        if (task.getRates() == null || task.getRates().isEmpty()) {
            return 0.0;
        }
        
        List<Rate> validRates = task.getRates().stream()
            .filter(rate -> isRateValid(rate, now))
            .collect(Collectors.toList());
            
        if (validRates.isEmpty()) {
            return 0.0;
        }
        
        switch (strategy.toLowerCase()) {
            case "min":
                return validRates.stream().mapToDouble(Rate::getPrice).min().orElse(0.0);
            case "max":
                return validRates.stream().mapToDouble(Rate::getPrice).max().orElse(0.0);
            case "avg":
                return validRates.stream().mapToDouble(Rate::getPrice).average().orElse(0.0);
            case "latest":
                // Prendre le tarif avec la date de début la plus récente
                return validRates.stream()
                    .max((r1, r2) -> {
                        LocalDate date1 = r1.getStartDate() != null ? r1.getStartDate() : LocalDate.MIN;
                        LocalDate date2 = r2.getStartDate() != null ? r2.getStartDate() : LocalDate.MIN;
                        return date1.compareTo(date2);
                    })
                    .map(Rate::getPrice)
                    .orElse(0.0);
            default:
                return validRates.stream().mapToDouble(Rate::getPrice).min().orElse(0.0);
        }
    }
}
