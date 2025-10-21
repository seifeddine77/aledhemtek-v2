package com.aledhemtek.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import com.aledhemtek.model.Consultant;

import java.util.Optional;

public interface ConsultantRepository extends JpaRepository<Consultant, Long> {
    Optional<Consultant> findByEmail(String email);
}
