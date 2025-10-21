package com.aledhemtek.controllers;

import com.aledhemtek.services.AutoInvoiceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/test")
public class TestController {

    @Autowired
    private AutoInvoiceService autoInvoiceService;

    /**
     * Test endpoint to force invoice generation for a completed reservation
     */
    @PostMapping("/generate-invoice/{reservationId}")
    public ResponseEntity<?> testGenerateInvoice(@PathVariable Long reservationId) {
        try {
            System.out.println("[TEST] Forcing invoice generation for reservation: " + reservationId);
            autoInvoiceService.generateInvoiceForCompletedReservation(reservationId);
            return ResponseEntity.ok(Map.of("message", "Invoice generation triggered for reservation " + reservationId));
        } catch (Exception e) {
            System.err.println("[TEST ERROR] " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
