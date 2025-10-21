package com.aledhemtek.services;

import com.aledhemtek.dto.EvaluationDto;
import com.aledhemtek.interfaces.EvaluationService;
import com.aledhemtek.model.Evaluation;
import com.aledhemtek.model.Reservation;
import com.aledhemtek.model.User;
import com.aledhemtek.repositories.EvaluationRepository;
import com.aledhemtek.repositories.ReservationRepository;
import com.aledhemtek.repositories.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class EvaluationServiceImpl implements EvaluationService {
    
    @Autowired
    private EvaluationRepository evaluationRepository;
    
    @Autowired
    private ReservationRepository reservationRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @Override
    public EvaluationDto createEvaluation(EvaluationDto evaluationDto) {
        // Vérifier que la réservation existe
        Reservation reservation = reservationRepository.findById(evaluationDto.getReservationId())
                .orElseThrow(() -> new RuntimeException("Reservation not found with id: " + evaluationDto.getReservationId()));
        
        // Vérifier que le client existe
        User client = userRepository.findById(evaluationDto.getClientId())
                .orElseThrow(() -> new RuntimeException("Client not found with id: " + evaluationDto.getClientId()));
        
        // Vérifier qu'il n'y a pas déjà une évaluation pour cette réservation
        if (evaluationRepository.existsByReservationId(evaluationDto.getReservationId())) {
            throw new RuntimeException("Evaluation already exists for this reservation");
        }
        
        // Créer l'évaluation
        Evaluation evaluation = new Evaluation();
        evaluation.setReservation(reservation);
        evaluation.setClient(client);
        evaluation.setGeneralRating(evaluationDto.getGeneralRating());
        evaluation.setServiceQualityRating(evaluationDto.getServiceQualityRating());
        evaluation.setPunctualityRating(evaluationDto.getPunctualityRating());
        evaluation.setCommunicationRating(evaluationDto.getCommunicationRating());
        evaluation.setComment(evaluationDto.getComment());
        
        Evaluation savedEvaluation = evaluationRepository.save(evaluation);
        return convertToDto(savedEvaluation);
    }
    
    @Override
    public EvaluationDto updateEvaluation(Long evaluationId, EvaluationDto evaluationDto) {
        Evaluation evaluation = evaluationRepository.findById(evaluationId)
                .orElseThrow(() -> new RuntimeException("Evaluation not found with id: " + evaluationId));
        
        evaluation.setGeneralRating(evaluationDto.getGeneralRating());
        evaluation.setServiceQualityRating(evaluationDto.getServiceQualityRating());
        evaluation.setPunctualityRating(evaluationDto.getPunctualityRating());
        evaluation.setCommunicationRating(evaluationDto.getCommunicationRating());
        evaluation.setComment(evaluationDto.getComment());
        evaluation.setUpdatedAt(LocalDateTime.now());
        
        Evaluation updatedEvaluation = evaluationRepository.save(evaluation);
        return convertToDto(updatedEvaluation);
    }
    
    @Override
    public EvaluationDto getEvaluationById(Long evaluationId) {
        Evaluation evaluation = evaluationRepository.findById(evaluationId)
                .orElseThrow(() -> new RuntimeException("Evaluation not found with id: " + evaluationId));
        return convertToDto(evaluation);
    }
    
    @Override
    public EvaluationDto getEvaluationByReservationId(Long reservationId) {
        Evaluation evaluation = evaluationRepository.findByReservationId(reservationId)
                .orElseThrow(() -> new RuntimeException("Evaluation not found for reservation id: " + reservationId));
        return convertToDto(evaluation);
    }
    
    @Override
    public List<EvaluationDto> getEvaluationsByClientId(Long clientId) {
        List<Evaluation> evaluations = evaluationRepository.findByClientId(clientId);
        return evaluations.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }
    
    @Override
    public List<EvaluationDto> getEvaluationsByConsultantId(Long consultantId) {
        List<Evaluation> evaluations = evaluationRepository.findByConsultantId(consultantId);
        return evaluations.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }
    
    @Override
    public List<EvaluationDto> getAllEvaluations() {
        List<Evaluation> evaluations = evaluationRepository.findAll();
        return evaluations.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }
    
    @Override
    public void deleteEvaluation(Long evaluationId) {
        if (!evaluationRepository.existsById(evaluationId)) {
            throw new RuntimeException("Evaluation not found with id: " + evaluationId);
        }
        evaluationRepository.deleteById(evaluationId);
    }
    
    @Override
    public boolean hasEvaluation(Long reservationId) {
        return evaluationRepository.existsByReservationId(reservationId);
    }
    
    @Override
    public Double getConsultantAverageRating(Long consultantId) {
        Double average = evaluationRepository.getAverageRatingByConsultant(consultantId);
        return average != null ? average : 0.0;
    }
    
    @Override
    public Long getConsultantEvaluationCount(Long consultantId) {
        return evaluationRepository.countByConsultantId(consultantId);
    }
    
    @Override
    public List<EvaluationDto> getRecentEvaluations() {
        LocalDateTime thirtyDaysAgo = LocalDateTime.now().minusDays(30);
        List<Evaluation> evaluations = evaluationRepository.findRecentEvaluations(thirtyDaysAgo);
        return evaluations.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }
    
    @Override
    public List<EvaluationDto> getTopRatedEvaluations() {
        List<Evaluation> evaluations = evaluationRepository.findTopRatedEvaluations(4.0);
        return evaluations.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }
    
    @Override
    public List<EvaluationDto> getFeaturedEvaluationsForHome() {
        // Récupérer les 6 meilleures évaluations récentes (note >= 4.0) pour la page d'accueil
        List<Evaluation> evaluations = evaluationRepository.findTopRatedEvaluations(4.0);
        return evaluations.stream()
                .filter(evaluation -> evaluation.getComment() != null && !evaluation.getComment().trim().isEmpty())
                .sorted((e1, e2) -> e2.getCreatedAt().compareTo(e1.getCreatedAt()))
                .limit(6)
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }
    
    private EvaluationDto convertToDto(Evaluation evaluation) {
        EvaluationDto dto = new EvaluationDto();
        dto.setId(evaluation.getId());
        dto.setReservationId(evaluation.getReservation().getId());
        dto.setReservationTitle(evaluation.getReservation().getTitle());
        dto.setClientId(evaluation.getClient().getId());
        dto.setClientName(evaluation.getClient().getFirstName() + " " + evaluation.getClient().getLastName());
        dto.setGeneralRating(evaluation.getGeneralRating());
        dto.setServiceQualityRating(evaluation.getServiceQualityRating());
        dto.setPunctualityRating(evaluation.getPunctualityRating());
        dto.setCommunicationRating(evaluation.getCommunicationRating());
        dto.setComment(evaluation.getComment());
        dto.setAverageRating(evaluation.getAverageRating());
        dto.setCreatedAt(evaluation.getCreatedAt());
        dto.setUpdatedAt(evaluation.getUpdatedAt());
        return dto;
    }

    @Override
    public void createSampleEvaluations() {
        // Méthode simplifiée pour éviter les erreurs de compilation
        // Les données de test peuvent être créées manuellement via l'interface utilisateur
        System.out.println("Méthode createSampleEvaluations appelée - utilisez l'interface pour créer des évaluations");
    }
}
