package com.aledhemtek.repositories;

import com.aledhemtek.model.Evaluation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface EvaluationRepository extends JpaRepository<Evaluation, Long> {
    
    /**
     * Trouver une évaluation par ID de réservation
     */
    Optional<Evaluation> findByReservationId(Long reservationId);
    
    /**
     * Trouver toutes les évaluations d'un client
     */
    List<Evaluation> findByClientId(Long clientId);
    
    /**
     * Trouver toutes les évaluations pour un consultant
     */
    @Query("SELECT e FROM Evaluation e WHERE e.reservation.consultant.id = :consultantId")
    List<Evaluation> findByConsultantId(@Param("consultantId") Long consultantId);
    
    /**
     * Vérifier si une réservation a déjà une évaluation
     */
    boolean existsByReservationId(Long reservationId);
    
    /**
     * Calculer la note moyenne d'un consultant
     */
    @Query("SELECT AVG((e.generalRating + e.serviceQualityRating + e.punctualityRating + e.communicationRating) / 4.0) " +
           "FROM Evaluation e WHERE e.reservation.consultant.id = :consultantId")
    Double getAverageRatingByConsultant(@Param("consultantId") Long consultantId);
    
    /**
     * Compter le nombre d'évaluations d'un consultant
     */
    @Query("SELECT COUNT(e) FROM Evaluation e WHERE e.reservation.consultant.id = :consultantId")
    Long countByConsultantId(@Param("consultantId") Long consultantId);
    
    /**
     * Trouver les évaluations récentes (dernières 30 jours)
     */
    @Query("SELECT e FROM Evaluation e WHERE e.createdAt >= :thirtyDaysAgo ORDER BY e.createdAt DESC")
    List<Evaluation> findRecentEvaluations(@Param("thirtyDaysAgo") java.time.LocalDateTime thirtyDaysAgo);
    
    /**
     * Trouver les meilleures évaluations (note >= 4)
     */
    @Query("SELECT e FROM Evaluation e WHERE (e.generalRating + e.serviceQualityRating + e.punctualityRating + e.communicationRating) / 4.0 >= :minRating ORDER BY e.createdAt DESC")
    List<Evaluation> findTopRatedEvaluations(@Param("minRating") Double minRating);
}
