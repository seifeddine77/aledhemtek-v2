package com.aledhemtek.repositories;

import com.aledhemtek.model.Rate;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface RateRepository extends JpaRepository<Rate, Long> {

    /**
     * Trouver les tarifs par plage de prix
     */
    List<Rate> findByPriceBetween(Double minPrice, Double maxPrice);

    /**
     * Trouver les tarifs valides à une date donnée
     */
    @Query("SELECT r FROM Rate r WHERE (r.startDate IS NULL OR r.startDate <= :date) AND (r.endDate IS NULL OR r.endDate >= :date)")
    List<Rate> findValidRatesAtDate(@Param("date") LocalDate date);

    /**
     * Trouver les tarifs expirés
     */
    @Query("SELECT r FROM Rate r WHERE r.endDate IS NOT NULL AND r.endDate < :date")
    List<Rate> findExpiredRates(@Param("date") LocalDate date);

    /**
     * Trouver les tarifs qui expirent entre deux dates
     */
    @Query("SELECT r FROM Rate r WHERE r.endDate IS NOT NULL AND r.endDate BETWEEN :startDate AND :endDate")
    List<Rate> findRatesExpiringBetween(@Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);

    /**
     * Trouver les tarifs par prix exact
     */
    List<Rate> findByPrice(Double price);

    /**
     * Trouver les tarifs avec prix supérieur à une valeur
     */
    List<Rate> findByPriceGreaterThan(Double price);

    /**
     * Trouver les tarifs avec prix inférieur à une valeur
     */
    List<Rate> findByPriceLessThan(Double price);

    /**
     * Trouver les tarifs qui commencent après une date
     */
    List<Rate> findByStartDateAfter(LocalDate date);

    /**
     * Trouver les tarifs qui se terminent avant une date
     */
    List<Rate> findByEndDateBefore(LocalDate date);
}
