package com.aledhemtek.interfaces;

import com.aledhemtek.dto.RateDto;

import java.time.LocalDate;
import java.util.List;

public interface RateService {

    /**
     * Récupérer tous les tarifs
     */
    List<RateDto> getAllRates();

    /**
     * Récupérer un tarif par ID
     */
    RateDto getRateById(Long rateId);

    /**
     * Créer un nouveau tarif
     */
    RateDto createRate(RateDto rateDto);

    /**
     * Mettre à jour un tarif
     */
    RateDto updateRate(Long rateId, RateDto rateDto);

    /**
     * Supprimer un tarif
     */
    void deleteRate(Long rateId);

    /**
     * Récupérer les tarifs valides à une date donnée
     */
    List<RateDto> getValidRatesAtDate(LocalDate date);

    /**
     * Récupérer les tarifs actuellement valides
     */
    List<RateDto> getCurrentValidRates();

    /**
     * Récupérer les tarifs par plage de prix
     */
    List<RateDto> getRatesByPriceRange(Double minPrice, Double maxPrice);

    /**
     * Récupérer les tarifs expirés
     */
    List<RateDto> getExpiredRates();

    /**
     * Récupérer les tarifs qui vont expirer dans les X jours
     */
    List<RateDto> getRatesExpiringInDays(int days);
}
