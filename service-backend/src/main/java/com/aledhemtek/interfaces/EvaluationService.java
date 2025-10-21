package com.aledhemtek.interfaces;

import com.aledhemtek.dto.EvaluationDto;

import java.util.List;

public interface EvaluationService {
    
    /**
     * Créer une nouvelle évaluation
     */
    EvaluationDto createEvaluation(EvaluationDto evaluationDto);
    
    /**
     * Mettre à jour une évaluation existante
     */
    EvaluationDto updateEvaluation(Long evaluationId, EvaluationDto evaluationDto);
    
    /**
     * Récupérer une évaluation par ID
     */
    EvaluationDto getEvaluationById(Long evaluationId);
    
    /**
     * Récupérer une évaluation par ID de réservation
     */
    EvaluationDto getEvaluationByReservationId(Long reservationId);
    
    /**
     * Récupérer toutes les évaluations d'un client
     */
    List<EvaluationDto> getEvaluationsByClientId(Long clientId);
    
    /**
     * Récupérer toutes les évaluations pour un consultant
     */
    List<EvaluationDto> getEvaluationsByConsultantId(Long consultantId);
    
    /**
     * Récupérer toutes les évaluations
     */
    List<EvaluationDto> getAllEvaluations();
    
    /**
     * Supprimer une évaluation
     */
    void deleteEvaluation(Long evaluationId);
    
    /**
     * Vérifier si une réservation a déjà une évaluation
     */
    boolean hasEvaluation(Long reservationId);
    
    /**
     * Calculer la note moyenne d'un consultant
     */
    Double getConsultantAverageRating(Long consultantId);
    
    /**
     * Compter le nombre d'évaluations d'un consultant
     */
    Long getConsultantEvaluationCount(Long consultantId);
    
    /**
     * Récupérer les évaluations récentes
     */
    List<EvaluationDto> getRecentEvaluations();
    
    /**
     * Récupérer les meilleures évaluations
     */
    List<EvaluationDto> getTopRatedEvaluations();
    
    /**
     * Récupérer les évaluations mises en avant pour la page d'accueil
     */
    List<EvaluationDto> getFeaturedEvaluationsForHome();
    
    /**
     * Créer des évaluations de test pour la démonstration
     */
    void createSampleEvaluations();
}
