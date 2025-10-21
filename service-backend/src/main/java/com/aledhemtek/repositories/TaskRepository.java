package com.aledhemtek.repositories;

import com.aledhemtek.model.Task;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TaskRepository extends JpaRepository<Task, Long> {

    /**
     * Trouver les tâches par ID de service
     */
    List<Task> findByServiceId(Long serviceId);

    /**
     * Rechercher les tâches par nom (insensible à la casse)
     */
    List<Task> findByNameContainingIgnoreCase(String keyword);

    /**
     * Trouver les tâches par consultant
     */
    List<Task> findByConsultantId(Long consultantId);
    
    /**
     * Trouver les tâches par IDs avec leurs rates chargés
     */
    @Query("SELECT DISTINCT t FROM Task t LEFT JOIN FETCH t.rates WHERE t.id IN :taskIds")
    List<Task> findAllByIdWithRates(@Param("taskIds") List<Long> taskIds);

    /**
     * Trouver les tâches par réservation
     */
    List<Task> findByReservationId(Long reservationId);

    /**
     * Rechercher les tâches par description
     */
    List<Task> findByDescriptionContainingIgnoreCase(String keyword);

    /**
     * Trouver les tâches avec une durée spécifique
     */
    List<Task> findByDuration(Integer duration);

    /**
     * Trouver les tâches avec une durée entre min et max
     */
    List<Task> findByDurationBetween(Integer minDuration, Integer maxDuration);

    /**
     * Recherche globale dans nom et description
     */
    @Query("SELECT t FROM Task t WHERE LOWER(t.name) LIKE LOWER(CONCAT('%', :keyword, '%')) OR LOWER(t.description) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    List<Task> searchByKeyword(@Param("keyword") String keyword);
}
