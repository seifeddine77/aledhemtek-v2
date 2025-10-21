package com.aledhemtek.interfaces;

import com.aledhemtek.dto.ConsultantDTO;
import org.springframework.http.ResponseEntity;

import java.util.List;

public interface ConsultantInterface {
    ResponseEntity<?> createConsultant(ConsultantDTO dto);
    List<ConsultantDTO> getAllConsultants();
    ConsultantDTO getConsultantById(Long id);
    ConsultantDTO approveConsultant(Long id);
    ConsultantDTO rejectConsultant(Long id);
    ConsultantDTO updateConsultant(Long id, ConsultantDTO dto);
    void deleteConsultant(Long id);
}
