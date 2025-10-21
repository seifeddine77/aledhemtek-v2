package com.aledhemtek.services;

import com.aledhemtek.interfaces.InvoiceService;
import com.aledhemtek.model.*;
import com.aledhemtek.repositories.ReservationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.annotation.Propagation;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;


@Service
public class AutoInvoiceService {

    private void sendInvoiceToClient(Invoice invoice, byte[] pdfAttachment) {
        try {
                        if (invoice.getReservation() == null || invoice.getReservation().getClient() == null) {
                logger.error("Cannot send email. Invoice {} is not associated with a client.", invoice.getInvoiceNumber());
                return;
            }
            logger.info("Attempting to send invoice {} to client {}", invoice.getInvoiceNumber(), invoice.getReservation().getClient().getEmail());
            emailService.sendInvoiceEmail(invoice, pdfAttachment);
            logger.info("Successfully sent invoice email for invoice {}", invoice.getInvoiceNumber());
        } catch (Exception e) {
            logger.error("Failed to send invoice email for invoice {}: {}", invoice.getInvoiceNumber(), e.getMessage());
        }
    }

    private byte[] generateInvoicePDF(Invoice invoice) {
        try {
            logger.info("Generating PDF for invoice {}", invoice.getInvoiceNumber());
            byte[] pdf = invoicePDFService.generateInvoicePDFBytes(invoice);
            logger.info("Successfully generated PDF for invoice {}", invoice.getInvoiceNumber());
            return pdf;
        } catch (Exception e) {
            logger.error("Failed to generate PDF for invoice {}: {}", invoice.getInvoiceNumber(), e.getMessage());
            throw new RuntimeException("Failed to generate PDF in AutoInvoiceService for invoice " + invoice.getId(), e); // Return empty byte array on failure
        }
    }

    
    private static final Logger logger = LoggerFactory.getLogger(AutoInvoiceService.class);
    
    @Autowired
    private InvoiceService invoiceService;
    
    @Autowired
    private ReservationRepository reservationRepository;
    
    @Autowired
    private EmailService emailService;

    @Autowired
    private InvoicePDFService invoicePDFService;
    
    /**
     * Generate invoice automatically when reservation is completed
     */
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void generateInvoiceForCompletedReservation(Long reservationId) {
        System.out.println("[DEBUG] AutoInvoiceService.generateInvoiceForCompletedReservation called for reservation: " + reservationId);
        try {
            Reservation reservation = reservationRepository.findById(reservationId)
                .orElseThrow(() -> new RuntimeException("Reservation not found"));
            
            System.out.println("[DEBUG] Found reservation with status: " + reservation.getStatus());
            
            // Check if reservation is completed
            if (reservation.getStatus() != Reservation.ReservationStatus.COMPLETED) {
                logger.warn("Cannot generate invoice for reservation {} - not completed", reservationId);
                System.out.println("[DEBUG] Reservation not completed, exiting");
                return;
            }
            
            // Check if invoice already exists for this reservation
            System.out.println("[DEBUG] Checking if invoice already exists for reservation: " + reservationId);
            try {
                Optional<Invoice> existingInvoice = invoiceService.getInvoiceByReservationId(reservationId);
                System.out.println("[DEBUG] Existing invoice check result: " + existingInvoice.isPresent());
                if (existingInvoice.isPresent()) {
                    logger.info("Invoice already exists for reservation {}: {}", 
                               reservationId, existingInvoice.get().getInvoiceNumber());
                    System.out.println("[DEBUG] Invoice already exists, exiting: " + existingInvoice.get().getInvoiceNumber());
                    return;
                }
            } catch (Exception e) {
                logger.warn("Error checking existing invoice for reservation {}: {}", reservationId, e.getMessage());
                // Continue with creation but add extra safety
            }
            
            System.out.println("[DEBUG] No existing invoice found, proceeding with creation");
            logger.info("Creating new invoice for completed reservation {}", reservationId);
            
            // Create invoice with try-catch to handle duplicates
            try {
                System.out.println("[DEBUG] Step 1: Creating invoice from reservation");
                Invoice invoice = createInvoiceFromReservation(reservation);
                System.out.println("[DEBUG] Step 2: Invoice created successfully, now saving");
                Invoice savedInvoice = invoiceService.createInvoice(invoice);
                System.out.println("[DEBUG] Step 3: Invoice saved successfully with ID: " + savedInvoice.getId());
                
                // Generate PDF
                byte[] pdf = generateInvoicePDF(savedInvoice);
                
                // Send email to client with PDF attachment
                sendInvoiceToClient(savedInvoice, pdf);

                
                logger.info("Auto-generated invoice {} for completed reservation {}", 
                           savedInvoice.getInvoiceNumber(), reservationId);
                           
            } catch (org.springframework.dao.DataIntegrityViolationException e) {
                if (e.getMessage().contains("Duplicate entry") && e.getMessage().contains("invoice_number")) {
                    logger.warn("Invoice already exists for reservation {} - duplicate number detected", reservationId);
                    System.out.println("[DEBUG] Duplicate invoice number detected, skipping creation");
                } else {
                    logger.error("Data integrity error creating invoice for reservation {}: {}", reservationId, e.getMessage());
                    throw e;
                }
            } catch (Exception e) {
                logger.error("Failed to auto-generate invoice for reservation {}: {}", reservationId, e.getMessage());
                e.printStackTrace();
                throw e;
            }
            
        } catch (Exception e) {
            logger.error("OUTER CATCH - Failed to auto-generate invoice for reservation {}: {}", reservationId, e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Invoice generation failed: " + e.getMessage(), e);
        }
    }
    
    /**
     * Create invoice from completed reservation
     */
    private Invoice createInvoiceFromReservation(Reservation reservation) {
        System.out.println("[DEBUG] createInvoiceFromReservation - Starting for reservation: " + reservation.getId());
        Invoice invoice = new Invoice(reservation);
        System.out.println("[DEBUG] createInvoiceFromReservation - Invoice object created");
        invoice.setAutoGenerated(true);
        invoice.setStatus(Invoice.InvoiceStatus.PENDING);
        System.out.println("[DEBUG] createInvoiceFromReservation - Basic properties set");
        
        // Add invoice items based on reservation tasks
        if (reservation.getReservationTasks() != null && !reservation.getReservationTasks().isEmpty()) {
            for (ReservationTask reservationTask : reservation.getReservationTasks()) {
                InvoiceItem item = createInvoiceItemFromReservationTask(reservationTask, invoice);
                invoice.getInvoiceItems().add(item);
            }
        } else if (reservation.getTasks() != null && !reservation.getTasks().isEmpty()) {
            // Fallback to direct tasks if reservation tasks not available
            for (Task task : reservation.getTasks()) {
                InvoiceItem item = createInvoiceItemFromTask(task, invoice);
                invoice.getInvoiceItems().add(item);
            }
        }
        
        // Add service fee if applicable
        addServiceFeeIfApplicable(invoice);
        
        // Calculate amounts
        invoice.calculateAmounts();
        
        return invoice;
    }
    
    /**
     * Create invoice item from reservation task
     */
    private InvoiceItem createInvoiceItemFromReservationTask(ReservationTask reservationTask, Invoice invoice) {
        InvoiceItem item = new InvoiceItem();
        item.setInvoice(invoice);
        item.setDesignation(reservationTask.getTask().getName()); // Required field
        item.setDescription(reservationTask.getTask().getName());
        item.setQuantity(reservationTask.getQuantity());
        
        // Handle null unit price
        Double unitPrice = reservationTask.getUnitPrice();
        if (unitPrice == null) {
            // Try to get price from total price if available
            if (reservationTask.getTotalPrice() != null && reservationTask.getQuantity() != null && reservationTask.getQuantity() > 0) {
                unitPrice = reservationTask.getTotalPrice() / reservationTask.getQuantity();
                System.out.println("[DEBUG] Calculated unit price from total: " + unitPrice);
            } else {
                // Fallback to a default price or use reservation total price
                unitPrice = invoice.getReservation().getTotalPrice() != null ? 
                    invoice.getReservation().getTotalPrice() : 100.0;
                System.out.println("[DEBUG] Using fallback unit price: " + unitPrice);
            }
        }
        item.setUnitPrice(unitPrice);
        item.setTaxRate(20.0); // Default VAT rate
        
        // Add task description if available
        if (reservationTask.getTask().getDescription() != null) {
            item.setDescription(item.getDescription() + " - " + reservationTask.getTask().getDescription());
        }
        
        System.out.println("[DEBUG] Created invoice item: " + item.getDescription() + ", Qty: " + item.getQuantity() + ", Price: " + item.getUnitPrice());
        
        return item;
    }
    
    /**
     * Create invoice item from task (fallback method)
     */
    private InvoiceItem createInvoiceItemFromTask(Task task, Invoice invoice) {
        InvoiceItem item = new InvoiceItem();
        item.setInvoice(invoice);
        item.setDesignation(task.getName()); // Required field
        item.setDescription(task.getName());
        item.setQuantity(1);
        
        // Get current price from task rates
        Double currentPrice = getCurrentTaskPrice(task);
        item.setUnitPrice(currentPrice);
        item.setTaxRate(20.0); // Default VAT rate
        
        if (task.getDescription() != null) {
            item.setDescription(item.getDescription() + " - " + task.getDescription());
        }
        
        return item;
    }
    
    /**
     * Get current price for a task
     */
    private Double getCurrentTaskPrice(Task task) {
        if (task.getRates() == null || task.getRates().isEmpty()) {
            return 50.0; // Default price
        }
        
        LocalDate today = LocalDate.now();
        return task.getRates().stream()
            .filter(rate -> rate.getStartDate() == null || !today.isBefore(rate.getStartDate()))
            .filter(rate -> rate.getEndDate() == null || !today.isAfter(rate.getEndDate()))
            .mapToDouble(Rate::getPrice)
            .min()
            .orElse(50.0);
    }
    
    /**
     * Add service fee if applicable
     */
    private void addServiceFeeIfApplicable(Invoice invoice) {
        // Add a service fee of 5% of the total
        double subtotal = invoice.getInvoiceItems().stream()
            .mapToDouble(item -> item.getQuantity() * item.getUnitPrice())
            .sum();
        
        if (subtotal > 0) {
            InvoiceItem serviceFee = new InvoiceItem();
            serviceFee.setInvoice(invoice);
            serviceFee.setDesignation("Frais de service"); // Required field
            serviceFee.setDescription("Frais de service");
            serviceFee.setQuantity(1);
            serviceFee.setUnitPrice(subtotal * 0.05); // 5% service fee
            serviceFee.setTaxRate(20.0);
            
            invoice.getInvoiceItems().add(serviceFee);
        }
    }
    
    /**
     * Scheduled task to check for overdue invoices and send reminders
     * Runs every day at 9:00 AM
     */
    @Scheduled(cron = "0 0 9 * * ?")
    public void processOverdueInvoices() {
        logger.info("Starting overdue invoice processing...");
        
        try {
            List<Invoice> overdueInvoices = invoiceService.getOverdueInvoices();
            
            for (Invoice invoice : overdueInvoices) {
                if (invoice.shouldSendReminder()) {
                    sendReminderEmail(invoice);
                }
                
                // Update status to OVERDUE if not already
                if (invoice.getStatus() != Invoice.InvoiceStatus.OVERDUE) {
                    invoice.setStatus(Invoice.InvoiceStatus.OVERDUE);
                    invoiceService.updateInvoice(invoice);
                }
            }
            
            logger.info("Processed {} overdue invoices", overdueInvoices.size());
            
        } catch (Exception e) {
            logger.error("Error processing overdue invoices: {}", e.getMessage());
        }
    }
    
    /**
     * Send reminder email for overdue invoice
     */
    private void sendReminderEmail(Invoice invoice) {
        try {
            boolean reminderSent = emailService.sendReminderEmail(invoice);
            if (reminderSent) {
                invoice.incrementReminderCount();
                invoiceService.updateInvoice(invoice);
                logger.info("Reminder email sent for overdue invoice: {}", invoice.getInvoiceNumber());
            }
        } catch (Exception e) {
            logger.error("Failed to send reminder email for invoice {}: {}", 
                        invoice.getInvoiceNumber(), e.getMessage());
        }
    }
    
    /**
     * Scheduled task to auto-generate invoices for completed reservations
     * Runs every hour
     */
    @Scheduled(fixedRate = 3600000) // 1 hour
    public void autoGenerateInvoicesForCompletedReservations() {
        logger.info("Checking for completed reservations without invoices...");
        
        try {
            // Use the new custom query method to find completed reservations without invoices
            List<Reservation> completedReservations = reservationRepository
                .findCompletedReservationsWithoutInvoices();
            
            for (Reservation reservation : completedReservations) {
                generateInvoiceForCompletedReservation(reservation.getId());
            }
            
            if (!completedReservations.isEmpty()) {
                logger.info("Auto-generated invoices for {} completed reservations", 
                           completedReservations.size());
            }
            
        } catch (Exception e) {
            logger.error("Error in auto-invoice generation: {}", e.getMessage());
        }
    }
}
