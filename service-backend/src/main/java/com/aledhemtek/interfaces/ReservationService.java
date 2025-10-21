package com.aledhemtek.interfaces;

import com.aledhemtek.dto.ReservationDto;
import com.aledhemtek.model.Reservation;
import com.aledhemtek.model.Task;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

public interface ReservationService {
    
    ReservationDto createReservation(ReservationDto reservationDto);
    
    ReservationDto updateReservation(Long id, ReservationDto reservationDto);
    
    void deleteReservation(Long id);
    
    ReservationDto getReservationById(Long id);
    
    List<ReservationDto> getAllReservations();
    
    List<ReservationDto> getReservationsByConsultant(Long consultantId);
    
    List<ReservationDto> getReservationsByClient(Long clientId);
    
    List<ReservationDto> getReservationsByStatus(Reservation.ReservationStatus status);
    
    List<ReservationDto> getReservationsByDateRange(LocalDateTime startDate, LocalDateTime endDate);
    
    List<ReservationDto> getConsultantCalendar(Long consultantId, LocalDateTime startDate, LocalDateTime endDate);
    
    List<ReservationDto> getUnassignedReservations();
    
    ReservationDto assignConsultantToReservation(Long reservationId, Long consultantId);
    
    ReservationDto updateReservationStatus(Long reservationId, Reservation.ReservationStatus status);
    
    boolean isConsultantAvailable(Long consultantId, LocalDateTime startDate, LocalDateTime endDate);
    
    // Méthodes pour le calcul des prix
    Double calculateReservationTotalPrice(Long reservationId);
    
    Double calculateTasksTotalPrice(List<Task> tasks);
    
    Double calculateTasksTotalPriceByIds(List<Long> taskIds);
    
    // Nouvelle méthode pour calculer avec quantités
    Double calculateTasksTotalPriceWithQuantities(List<Long> taskIds, Map<String, Integer> taskQuantities);
    
    Double calculateTaskPrice(Task task);
    
    // Méthodes pour gérer les tâches d'une réservation
    ReservationDto addTasksToReservation(Long reservationId, List<Long> taskIds, Map<String, Integer> taskQuantities);
    
    ReservationDto removeTaskFromReservation(Long reservationId, Long taskId);
    
    ReservationDto updateReservationTaskQuantity(Long reservationId, Long taskId, Integer quantity);
}
