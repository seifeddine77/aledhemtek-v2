package com.aledhemtek.controllers;

import com.aledhemtek.dto.RateDto;
import com.aledhemtek.interfaces.RateService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/rates")
public class RateController {

    @Autowired
    private RateService rateService;

    /**
     * Récupérer tous les tarifs
     */
    @GetMapping
    public ResponseEntity<List<RateDto>> getAllRates() {
        List<RateDto> rates = rateService.getAllRates();
        return ResponseEntity.ok(rates);
    }

    /**
     * Récupérer un tarif par ID
     */
    @GetMapping("/{rateId}")
    public ResponseEntity<RateDto> getRateById(@PathVariable Long rateId) {
        RateDto rate = rateService.getRateById(rateId);
        if (rate != null) {
            return ResponseEntity.ok(rate);
        }
        return ResponseEntity.notFound().build();
    }

    /**
     * Créer un nouveau tarif
     */
    @PostMapping
    public ResponseEntity<RateDto> createRate(@RequestBody RateDto rateDto) {
        RateDto createdRate = rateService.createRate(rateDto);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdRate);
    }

    /**
     * Mettre à jour un tarif
     */
    @PutMapping("/{rateId}")
    public ResponseEntity<RateDto> updateRate(
            @PathVariable Long rateId,
            @RequestBody RateDto rateDto) {
        RateDto updatedRate = rateService.updateRate(rateId, rateDto);
        if (updatedRate != null) {
            return ResponseEntity.ok(updatedRate);
        }
        return ResponseEntity.notFound().build();
    }

    /**
     * Supprimer un tarif
     */
    @DeleteMapping("/{rateId}")
    public ResponseEntity<Void> deleteRate(@PathVariable Long rateId) {
        rateService.deleteRate(rateId);
        return ResponseEntity.noContent().build();
    }

    /**
     * Récupérer les tarifs valides à une date donnée
     */
    @GetMapping("/valid")
    public ResponseEntity<List<RateDto>> getValidRates(@RequestParam LocalDate date) {
        List<RateDto> validRates = rateService.getValidRatesAtDate(date);
        return ResponseEntity.ok(validRates);
    }

    /**
     * Récupérer les tarifs actuellement valides
     */
    @GetMapping("/current")
    public ResponseEntity<List<RateDto>> getCurrentValidRates() {
        List<RateDto> currentRates = rateService.getCurrentValidRates();
        return ResponseEntity.ok(currentRates);
    }

    /**
     * Récupérer les tarifs par plage de prix
     */
    @GetMapping("/price-range")
    public ResponseEntity<List<RateDto>> getRatesByPriceRange(
            @RequestParam Double minPrice,
            @RequestParam Double maxPrice) {
        List<RateDto> rates = rateService.getRatesByPriceRange(minPrice, maxPrice);
        return ResponseEntity.ok(rates);
    }

    /**
     * Récupérer les tarifs expirés
     */
    @GetMapping("/expired")
    public ResponseEntity<List<RateDto>> getExpiredRates() {
        List<RateDto> expiredRates = rateService.getExpiredRates();
        return ResponseEntity.ok(expiredRates);
    }

    /**
     * Récupérer les tarifs qui vont expirer dans les X jours
     */
    @GetMapping("/expiring")
    public ResponseEntity<List<RateDto>> getRatesExpiringInDays(@RequestParam int days) {
        List<RateDto> expiringRates = rateService.getRatesExpiringInDays(days);
        return ResponseEntity.ok(expiringRates);
    }
}
