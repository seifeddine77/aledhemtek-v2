package com.aledhemtek.security;

import com.aledhemtek.config.CustomUserDetails;
import com.aledhemtek.enums.AccountStatus;
import com.aledhemtek.model.Client;
import com.aledhemtek.model.Consultant;
import com.aledhemtek.model.Reservation;
import com.aledhemtek.model.Reservation.ReservationStatus;
import com.aledhemtek.repositories.ConsultantRepository;
import com.aledhemtek.repositories.ReservationRepository;
import com.aledhemtek.services.AutoInvoiceService;
import com.aledhemtek.services.ReservationServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ReservationWorkflowSecurityTest {

    @Mock
    private ReservationRepository reservationRepository;

    @Mock
    private ConsultantRepository consultantRepository;

    @Mock
    private AutoInvoiceService autoInvoiceService;

    @InjectMocks
    private ReservationServiceImpl reservationService;

    private Reservation pendingReservation;
    private Consultant activeConsultant;

    @BeforeEach
    void setUp() {
        Client client = new Client();
        client.setId(100L);
        client.setEmail("client@example.com");

        activeConsultant = new Consultant();
        activeConsultant.setId(200L);
        activeConsultant.setEmail("consultant@example.com");
        activeConsultant.setStatus(AccountStatus.APPROVED);

        pendingReservation = new Reservation();
        pendingReservation.setId(1L);
        pendingReservation.setTitle("Consulting Session");
        pendingReservation.setStatus(ReservationStatus.PENDING);
        pendingReservation.setClient(client);
        pendingReservation.setStartDate(LocalDateTime.now().plusDays(1));
        pendingReservation.setEndDate(LocalDateTime.now().plusDays(1).plusHours(2));
    }

    @Test
    void testTransitionToAssignedWithoutConsultantThrowsIllegalState() {
        when(reservationRepository.findById(1L)).thenReturn(Optional.of(pendingReservation));

        assertThrows(IllegalStateException.class, () -> {
            reservationService.updateReservationStatus(1L, ReservationStatus.ASSIGNED);
        });
    }

    @Test
    void testDirectJumpFromPendingToCompletedThrowsIllegalState() {
        when(reservationRepository.findById(1L)).thenReturn(Optional.of(pendingReservation));

        assertThrows(IllegalStateException.class, () -> {
            reservationService.updateReservationStatus(1L, ReservationStatus.COMPLETED);
        });
    }

    @Test
    void testValidLifecycleWorkflow() {
        when(reservationRepository.findById(1L)).thenReturn(Optional.of(pendingReservation));
        when(reservationRepository.save(any(Reservation.class))).thenAnswer(i -> i.getArgument(0));

        // Assign consultant
        pendingReservation.setConsultant(activeConsultant);
        var assignedDto = reservationService.updateReservationStatus(1L, ReservationStatus.ASSIGNED);
        assertEquals(ReservationStatus.ASSIGNED, assignedDto.getStatus());

        // Move to IN_PROGRESS
        var inProgressDto = reservationService.updateReservationStatus(1L, ReservationStatus.IN_PROGRESS);
        assertEquals(ReservationStatus.IN_PROGRESS, inProgressDto.getStatus());

        // Move to COMPLETED (triggers auto invoice)
        var completedDto = reservationService.updateReservationStatus(1L, ReservationStatus.COMPLETED);
        assertEquals(ReservationStatus.COMPLETED, completedDto.getStatus());
        verify(autoInvoiceService, times(1)).generateInvoiceForCompletedReservation(1L);
    }

    @Test
    void testCannotModifyCancelledReservation() {
        pendingReservation.setStatus(ReservationStatus.CANCELLED);
        when(reservationRepository.findById(1L)).thenReturn(Optional.of(pendingReservation));

        assertThrows(IllegalStateException.class, () -> {
            reservationService.updateReservationStatus(1L, ReservationStatus.IN_PROGRESS);
        });
    }

    @Test
    void testCannotModifyCompletedReservation() {
        pendingReservation.setStatus(ReservationStatus.COMPLETED);
        when(reservationRepository.findById(1L)).thenReturn(Optional.of(pendingReservation));

        assertThrows(IllegalStateException.class, () -> {
            reservationService.updateReservationStatus(1L, ReservationStatus.CANCELLED);
        });
    }

    @Test
    void testCustomUserDetailsConsultantApprovalCheck() {
        Consultant pendingConsultant = new Consultant();
        pendingConsultant.setStatus(AccountStatus.PENDING);
        pendingConsultant.setEnabled(true);
        pendingConsultant.setRoles(new ArrayList<>());

        CustomUserDetails pendingDetails = new CustomUserDetails(pendingConsultant);
        assertFalse(pendingDetails.isEnabled(), "Pending consultant should not be enabled for login");

        Consultant approvedConsultant = new Consultant();
        approvedConsultant.setStatus(AccountStatus.APPROVED);
        approvedConsultant.setEnabled(true);
        approvedConsultant.setRoles(new ArrayList<>());

        CustomUserDetails approvedDetails = new CustomUserDetails(approvedConsultant);
        assertTrue(approvedDetails.isEnabled(), "Approved consultant should be enabled for login");
    }

    @Test
    void testCustomUserDetailsDisabledUserCheck() {
        Client disabledClient = new Client();
        disabledClient.setEnabled(false);
        disabledClient.setRoles(new ArrayList<>());

        CustomUserDetails disabledDetails = new CustomUserDetails(disabledClient);
        assertFalse(disabledDetails.isEnabled(), "Soft-deleted or disabled user should not be enabled");
    }
}
