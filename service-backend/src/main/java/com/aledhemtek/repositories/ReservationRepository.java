package com.aledhemtek.repositories;

import com.aledhemtek.model.Reservation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ReservationRepository extends JpaRepository<Reservation, Long> {
    
    List<Reservation> findByConsultantId(Long consultantId);
    
    List<Reservation> findByClientId(Long clientId);
    
    List<Reservation> findByStatus(Reservation.ReservationStatus status);
    
    @Query("SELECT r FROM Reservation r WHERE r.consultant.id = :consultantId " +
           "AND r.startDate >= :startDate AND r.endDate <= :endDate")
    List<Reservation> findByConsultantAndDateRange(
        @Param("consultantId") Long consultantId,
        @Param("startDate") LocalDateTime startDate,
        @Param("endDate") LocalDateTime endDate
    );
    
    @Query("SELECT r FROM Reservation r WHERE r.startDate >= :startDate AND r.endDate <= :endDate")
    List<Reservation> findByDateRange(
        @Param("startDate") LocalDateTime startDate,
        @Param("endDate") LocalDateTime endDate
    );
    
    @Query("SELECT r FROM Reservation r WHERE r.consultant IS NULL AND r.status = 'PENDING'")
    List<Reservation> findUnassignedReservations();
    
    @Query("SELECT COUNT(r) FROM Reservation r WHERE r.consultant.id = :consultantId " +
           "AND r.startDate <= :endDate AND r.endDate >= :startDate")
    Long countConflictingReservations(
        @Param("consultantId") Long consultantId,
        @Param("startDate") LocalDateTime startDate,
        @Param("endDate") LocalDateTime endDate
    );
    
    /**
     * Find completed reservations that don't have invoices yet
     */
    @Query("SELECT r FROM Reservation r WHERE r.status = 'COMPLETED' " +
           "AND r.id NOT IN (SELECT i.reservation.id FROM Invoice i WHERE i.reservation IS NOT NULL)")
    List<Reservation> findCompletedReservationsWithoutInvoices();
}
