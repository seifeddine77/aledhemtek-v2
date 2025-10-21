package com.aledhemtek.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import com.aledhemtek.model.Client;

import java.util.Optional;

public interface ClientRepository extends JpaRepository<Client, Long> {
    Optional<Client> findByEmail(String email);
}
