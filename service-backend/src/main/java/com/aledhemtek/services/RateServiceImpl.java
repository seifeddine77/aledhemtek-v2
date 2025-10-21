package com.aledhemtek.services;

import com.aledhemtek.dto.RateDto;
import com.aledhemtek.interfaces.RateService;
import com.aledhemtek.model.Rate;
import com.aledhemtek.repositories.RateRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class RateServiceImpl implements RateService {

    @Autowired
    private RateRepository rateRepository;

    @Override
    public List<RateDto> getAllRates() {
        return rateRepository.findAll()
                .stream()
                .map(Rate::getRateDto)
                .collect(Collectors.toList());
    }

    @Override
    public RateDto getRateById(Long rateId) {
        return rateRepository.findById(rateId)
                .map(Rate::getRateDto)
                .orElse(null);
    }

    @Override
    public RateDto createRate(RateDto rateDto) {
        Rate rate = new Rate();
        rate.setPrice(rateDto.getPrice());
        rate.setStartDate(rateDto.getStartDate());
        rate.setEndDate(rateDto.getEndDate());

        Rate savedRate = rateRepository.save(rate);
        return savedRate.getRateDto();
    }

    @Override
    public RateDto updateRate(Long rateId, RateDto rateDto) {
        Rate rate = rateRepository.findById(rateId)
                .orElseThrow(() -> new RuntimeException("Rate not found with id: " + rateId));

        rate.setPrice(rateDto.getPrice());
        rate.setStartDate(rateDto.getStartDate());
        rate.setEndDate(rateDto.getEndDate());

        Rate updatedRate = rateRepository.save(rate);
        return updatedRate.getRateDto();
    }

    @Override
    public void deleteRate(Long rateId) {
        if (!rateRepository.existsById(rateId)) {
            throw new RuntimeException("Rate not found with id: " + rateId);
        }
        rateRepository.deleteById(rateId);
    }

    @Override
    public List<RateDto> getValidRatesAtDate(LocalDate date) {
        return rateRepository.findValidRatesAtDate(date)
                .stream()
                .map(Rate::getRateDto)
                .collect(Collectors.toList());
    }

    @Override
    public List<RateDto> getCurrentValidRates() {
        LocalDate today = LocalDate.now();
        return getValidRatesAtDate(today);
    }

    @Override
    public List<RateDto> getRatesByPriceRange(Double minPrice, Double maxPrice) {
        return rateRepository.findByPriceBetween(minPrice, maxPrice)
                .stream()
                .map(Rate::getRateDto)
                .collect(Collectors.toList());
    }

    @Override
    public List<RateDto> getExpiredRates() {
        LocalDate today = LocalDate.now();
        return rateRepository.findExpiredRates(today)
                .stream()
                .map(Rate::getRateDto)
                .collect(Collectors.toList());
    }

    @Override
    public List<RateDto> getRatesExpiringInDays(int days) {
        LocalDate today = LocalDate.now();
        LocalDate futureDate = today.plusDays(days);
        return rateRepository.findRatesExpiringBetween(today, futureDate)
                .stream()
                .map(Rate::getRateDto)
                .collect(Collectors.toList());
    }
}
