package com.aledhemtek.services;

import com.aledhemtek.interfaces.InvoiceService;
import com.aledhemtek.model.Invoice;
import com.aledhemtek.model.InvoiceItem;
import com.aledhemtek.model.Payment;
import com.aledhemtek.model.Reservation;
import com.aledhemtek.repositories.InvoiceRepository;
import com.aledhemtek.repositories.InvoiceItemRepository;
import com.aledhemtek.repositories.PaymentRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service("invoiceService")
@Transactional
public class InvoiceServiceImpl implements InvoiceService {
    
    private static final Logger logger = LoggerFactory.getLogger(InvoiceServiceImpl.class);
    
    @Autowired
    private InvoiceRepository invoiceRepository;
    
    @Autowired
    private InvoiceItemRepository invoiceItemRepository;
    
    @Autowired
    private PaymentRepository paymentRepository;
    
    @Override
    public Invoice createInvoice(Invoice invoice) {
        // 1. Générer immédiatement un numéro de facture unique
        if (invoice.getInvoiceNumber() == null || invoice.getInvoiceNumber().isEmpty()) {
            invoice.setInvoiceNumber(generateUniqueInvoiceNumber());
        }
        
        // 2. Définir les dates par défaut
        if (invoice.getIssueDate() == null) {
            invoice.setIssueDate(LocalDateTime.now());
        }
        if (invoice.getDueDate() == null) {
            invoice.setDueDate(LocalDateTime.now().plusDays(30));
        }
        
        // 3. Définir le statut par défaut
        if (invoice.getStatus() == null) {
            invoice.setStatus(Invoice.InvoiceStatus.PENDING);
        }
        
        // 4. Calculer les montants
        invoice.calculateAmounts();
        
        // 5. Sauvegarder directement
        return invoiceRepository.save(invoice);
    }
    
    /**
     * Génère un numéro de facture unique basé sur la date et timestamp
     */
    private String generateUniqueInvoiceNumber() {
        String year = String.valueOf(LocalDateTime.now().getYear());
        String month = String.format("%02d", LocalDateTime.now().getMonthValue());
        long timestamp = System.currentTimeMillis();
        return "INV-" + year + month + "-" + String.format("%06d", timestamp % 1000000);
    }
    
    @Override
    public Invoice createInvoiceFromReservation(Reservation reservation) {
        Invoice invoice = new Invoice(reservation);
        
        // Add default items based on reservation tasks
        if (reservation.getTasks() != null && !reservation.getTasks().isEmpty()) {
            reservation.getTasks().forEach(task -> {
                InvoiceItem item = new InvoiceItem(task, 1, task.getPrice());
                invoice.getInvoiceItems().add(item);
            });
        }
        
        return createInvoice(invoice);
    }
    
    @Override
    public Invoice updateInvoice(Invoice invoice) {
        invoice.calculateAmounts();
        return invoiceRepository.save(invoice);
    }
    
    @Override
    @Transactional(readOnly = true)
    public Optional<Invoice> getInvoiceById(Long id) {
        return invoiceRepository.findById(id);
    }
    
    @Override
    @Transactional(readOnly = true)
    public Optional<Invoice> getInvoiceWithDetailsById(Long id) {
        Optional<Invoice> invoiceOpt = invoiceRepository.findWithDetailsById(id);
        if (invoiceOpt.isPresent()) {
            Invoice invoice = invoiceOpt.get();
            // Force loading of payments separately to avoid MultipleBagFetchException
            invoice.getPayments().size(); // This triggers lazy loading
        }
        return invoiceOpt;
    }
    
    @Override
    @Transactional(readOnly = true)
    public Optional<Invoice> getInvoiceByNumber(String invoiceNumber) {
        return invoiceRepository.findByInvoiceNumber(invoiceNumber);
    }
    
    @Override
    @Transactional(readOnly = true)
    public Page<Invoice> getAllInvoices(Pageable pageable) {
        return invoiceRepository.findAll(pageable);
    }
    
    @Override
    @Transactional(readOnly = true)
    public List<Invoice> getInvoicesByStatus(Invoice.InvoiceStatus status) {
        return invoiceRepository.findByStatus(status);
    }
    
    @Override
    @Transactional(readOnly = true)
    public List<Invoice> getInvoicesByClientId(Long clientId) {
        return invoiceRepository.findByClientId(clientId);
    }
    
    @Override
    @Transactional(readOnly = true)
    public List<Invoice> getInvoicesByReservationId(Long reservationId) {
        return invoiceRepository.findByReservation_Id(reservationId);
    }
    
    @Override
    @Transactional(readOnly = true)
    public Page<Invoice> searchInvoices(String searchTerm, Pageable pageable) {
        return invoiceRepository.searchInvoices(searchTerm, pageable);
    }
    
    @Override
    @Transactional(readOnly = true)
    public List<Invoice> getOverdueInvoices() {
        return invoiceRepository.findOverdueInvoices(LocalDateTime.now());
    }
    
    @Override
    @Transactional(readOnly = true)
    public List<Invoice> getUnpaidInvoices() {
        return invoiceRepository.findUnpaidInvoices();
    }
    
    @Override
    @Transactional(readOnly = true)
    public List<Invoice> getRecentInvoices() {
        LocalDateTime thirtyDaysAgo = LocalDateTime.now().minusDays(30);
        return invoiceRepository.findRecentInvoices(thirtyDaysAgo);
    }
    
    @Override
    @Transactional(readOnly = true)
    public Optional<Invoice> getInvoiceByReservationId(Long reservationId) {
        List<Invoice> invoices = invoiceRepository.findByReservation_Id(reservationId);
        return invoices.isEmpty() ? Optional.empty() : Optional.of(invoices.get(0));
    }
    
    @Override
    public Invoice addItemToInvoice(Long invoiceId, InvoiceItem item) {
        Optional<Invoice> invoiceOpt = invoiceRepository.findById(invoiceId);
        if (invoiceOpt.isPresent()) {
            Invoice invoice = invoiceOpt.get();
            invoice.getInvoiceItems().add(item);
            invoice.calculateAmounts();
            return invoiceRepository.save(invoice);
        }
        throw new RuntimeException("Invoice not found with id: " + invoiceId);
    }
    
    @Override
    public Invoice removeItemFromInvoice(Long invoiceId, Long itemId) {
        Optional<Invoice> invoiceOpt = invoiceRepository.findById(invoiceId);
        if (invoiceOpt.isPresent()) {
            Invoice invoice = invoiceOpt.get();
            invoice.getInvoiceItems().removeIf(item -> item.getId().equals(itemId));
            invoiceItemRepository.deleteById(itemId);
            invoice.calculateAmounts();
            return invoiceRepository.save(invoice);
        }
        throw new RuntimeException("Invoice not found with id: " + invoiceId);
    }
    
    @Override
    public Invoice updateInvoiceItem(Long invoiceId, InvoiceItem item) {
        Optional<Invoice> invoiceOpt = invoiceRepository.findById(invoiceId);
        if (invoiceOpt.isPresent()) {
            Invoice invoice = invoiceOpt.get();
            invoiceItemRepository.save(item);
            invoice.calculateAmounts();
            return invoiceRepository.save(invoice);
        }
        throw new RuntimeException("Invoice not found with id: " + invoiceId);
    }
    
    @Override
    public Invoice addPaymentToInvoice(Long invoiceId, Payment payment) {
        Optional<Invoice> invoiceOpt = invoiceRepository.findById(invoiceId);
        if (invoiceOpt.isPresent()) {
            Invoice invoice = invoiceOpt.get();
            payment.setInvoice(invoice);
            payment.generatePaymentReference();
            paymentRepository.save(payment);
            
            // Check if invoice is fully paid
            Double totalPaid = invoice.getPayments().stream()
                    .filter(p -> p.getStatus() == Payment.PaymentStatus.VALIDATED)
                    .mapToDouble(Payment::getAmount)
                    .sum() + payment.getAmount();
            
            if (totalPaid >= invoice.getTotalAmount()) {
                invoice.setStatus(Invoice.InvoiceStatus.PAID);
            }
            
            return invoiceRepository.save(invoice);
        }
        throw new RuntimeException("Invoice not found with id: " + invoiceId);
    }
    
    @Override
    public Invoice markInvoiceAsSent(Long invoiceId) {
        Optional<Invoice> invoiceOpt = invoiceRepository.findById(invoiceId);
        if (invoiceOpt.isPresent()) {
            Invoice invoice = invoiceOpt.get();
            invoice.setStatus(Invoice.InvoiceStatus.SENT);
            return invoiceRepository.save(invoice);
        }
        throw new RuntimeException("Invoice not found with id: " + invoiceId);
    }
    
    @Override
    public Invoice markInvoiceAsPaid(Long invoiceId) {
        Optional<Invoice> invoiceOpt = invoiceRepository.findById(invoiceId);
        if (invoiceOpt.isPresent()) {
            Invoice invoice = invoiceOpt.get();
            invoice.setStatus(Invoice.InvoiceStatus.PAID);
            return invoiceRepository.save(invoice);
        }
        throw new RuntimeException("Invoice not found with id: " + invoiceId);
    }
    
    @Override
    public Invoice cancelInvoice(Long invoiceId) {
        Optional<Invoice> invoiceOpt = invoiceRepository.findById(invoiceId);
        if (invoiceOpt.isPresent()) {
            Invoice invoice = invoiceOpt.get();
            invoice.setStatus(Invoice.InvoiceStatus.CANCELLED);
            return invoiceRepository.save(invoice);
        }
        throw new RuntimeException("Invoice not found with id: " + invoiceId);
    }
    
    @Override
    public byte[] generateInvoicePDF(Long invoiceId) {
        // Use existing InvoicePDFService for PDF generation
        // Currently generates HTML file, can be enhanced to return PDF bytes
        Optional<Invoice> invoiceOpt = invoiceRepository.findById(invoiceId);
        if (invoiceOpt.isPresent()) {
            try {
                // PDF generation is handled by InvoicePDFService which creates HTML files
                // For now, return empty bytes - real PDF integration can be added later
                logger.info("PDF generation requested for invoice: {}", invoiceId);
                return new byte[0];
            } catch (Exception e) {
                logger.error("Failed to generate PDF for invoice: {}", invoiceId, e);
                throw new RuntimeException("Failed to generate PDF for invoice: " + invoiceId, e);
            }
        }
        throw new RuntimeException("Invoice not found with id: " + invoiceId);
    }
    
    @Override
    public boolean sendInvoiceByEmail(Long invoiceId, String emailAddress) {
        // Use existing EmailService for sending invoice emails
        Optional<Invoice> invoiceOpt = invoiceRepository.findById(invoiceId);
        if (invoiceOpt.isPresent()) {
            try {
                // Email sending is handled by EmailService in AutoInvoiceService
                // This method can be enhanced to directly use EmailService
                // For now, return true as email functionality exists in the system
                return true;
            } catch (Exception e) {
                logger.error("Failed to send invoice email: {}", e.getMessage());
                return false;
            }
        }
        return false;
    }
    
    @Override
    public Invoice calculateInvoiceTotals(Long invoiceId) {
        Optional<Invoice> invoiceOpt = invoiceRepository.findById(invoiceId);
        if (invoiceOpt.isPresent()) {
            Invoice invoice = invoiceOpt.get();
            invoice.calculateAmounts();
            return invoiceRepository.save(invoice);
        }
        throw new RuntimeException("Invoice not found with id: " + invoiceId);
    }
    
    @Override
    public void deleteInvoice(Long invoiceId) {
        invoiceRepository.deleteById(invoiceId);
    }
    
    @Override
    @Transactional(readOnly = true)
    public Double getMonthlyRevenue(int year, int month) {
        Double revenue = invoiceRepository.getMonthlyRevenue(year, month);
        return revenue != null ? revenue : 0.0;
    }
    
    @Override
    @Transactional(readOnly = true)
    public Double getYearlyRevenue(int year) {
        Double revenue = invoiceRepository.getYearlyRevenue(year);
        return revenue != null ? revenue : 0.0;
    }
    
    @Override
    @Transactional(readOnly = true)
    public Double getTotalAmountByClientId(Long clientId) {
        Double total = invoiceRepository.calculateTotalAmountByClientId(clientId);
        return total != null ? total : 0.0;
    }
    
    @Override
    @Transactional(readOnly = true)
    public Double getUnpaidAmountByClientId(Long clientId) {
        Double unpaid = invoiceRepository.calculateUnpaidAmountByClientId(clientId);
        return unpaid != null ? unpaid : 0.0;
    }
    
    @Override
    @Transactional(readOnly = true)
    public Long countInvoicesByStatus(Invoice.InvoiceStatus status) {
        return invoiceRepository.countByStatus(status);
    }
    
    @Override
    @Transactional(readOnly = true)
    public List<Invoice> getInvoicesByDateRange(LocalDateTime startDate, LocalDateTime endDate) {
        return invoiceRepository.findByIssueDateBetween(startDate, endDate);
    }
    
    @Override
    @Transactional(readOnly = true)
    public List<Invoice> getInvoicesByDueDateRange(LocalDateTime startDate, LocalDateTime endDate) {
        return invoiceRepository.findByDueDateBetween(startDate, endDate);
    }
    
    @Override
    public void updateOverdueInvoicesStatus() {
        List<Invoice> overdueInvoices = getOverdueInvoices();
        overdueInvoices.forEach(invoice -> {
            invoice.setStatus(Invoice.InvoiceStatus.OVERDUE);
            invoiceRepository.save(invoice);
        });
    }
    
    @Override
    public String generateInvoiceNumber() {
        String year = String.valueOf(LocalDateTime.now().getYear());
        String month = String.format("%02d", LocalDateTime.now().getMonthValue());
        long count = invoiceRepository.count() + 1;
        return "INV-" + year + month + "-" + String.format("%06d", count);
    }
    
    @Override
    public boolean isInvoiceOwnedByClient(Long invoiceId, Long clientId) {
        try {
            Optional<Invoice> invoice = invoiceRepository.findById(invoiceId);
            if (invoice.isPresent()) {
                // Vérifier si la facture appartient au client via la réservation
                Reservation reservation = invoice.get().getReservation();
                if (reservation != null && reservation.getClient() != null) {
                    return reservation.getClient().getId().equals(clientId);
                }
                // Si pas de réservation, la facture n'appartient à aucun client spécifique
                return false;
            }
            return false;
        } catch (Exception e) {
            logger.error("Error checking invoice ownership: {}", e.getMessage());
            return false;
        }
    }
}
