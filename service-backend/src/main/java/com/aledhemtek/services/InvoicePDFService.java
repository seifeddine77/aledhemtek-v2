package com.aledhemtek.services;

import com.aledhemtek.model.Invoice;
import com.aledhemtek.model.InvoiceItem;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.openhtmltopdf.pdfboxout.PdfRendererBuilder;
import java.io.ByteArrayOutputStream;
import java.io.FileWriter;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.format.DateTimeFormatter;

@Service
public class InvoicePDFService {
    
    private static final Logger logger = LoggerFactory.getLogger(InvoicePDFService.class);
    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("dd/MM/yyyy");
    
    @Value("${invoice.pdf.directory:./invoices}")
    private String pdfDirectory;
    
    /**
     * Generate PDF file for invoice and return the file path
     */
    public String generateInvoicePDF(Invoice invoice) {
        try {
            // Create directory if it doesn't exist
            Path directory = Paths.get(pdfDirectory);
            if (!Files.exists(directory)) {
                Files.createDirectories(directory);
            }
            
            // Generate HTML content
            String htmlContent = generateInvoiceHTML(invoice);
            
            // Create PDF file path
            String fileName = "invoice_" + invoice.getInvoiceNumber().replace("/", "_") + ".html";
            Path filePath = directory.resolve(fileName);
            
            // Write HTML to file (in real implementation, convert to PDF)
            try (FileWriter writer = new FileWriter(filePath.toFile())) {
                writer.write(htmlContent);
            }
            
            logger.info("PDF generated for invoice: {} at path: {}", invoice.getInvoiceNumber(), filePath);
            return filePath.toString();
            
        } catch (Exception e) {
            logger.error("Error generating PDF for invoice: {}", invoice.getInvoiceNumber(), e);
            throw new RuntimeException("Error generating PDF for invoice: " + invoice.getInvoiceNumber(), e);
        }
    }
    
    /**
     * Generate PDF as byte array (for download)
     */
    public byte[] generateInvoicePDFBytes(Invoice invoice) {
        String htmlContent = generateInvoiceHTML(invoice);
        ByteArrayOutputStream os = new ByteArrayOutputStream();
        try {
            PdfRendererBuilder builder = new PdfRendererBuilder();
            builder.useFastMode();
            builder.withHtmlContent(htmlContent, null);
            builder.toStream(os);
            builder.run();
            logger.info("Successfully generated PDF bytes for invoice {}", invoice.getInvoiceNumber());
            return os.toByteArray();
        } catch (Exception e) {
            logger.error("Error generating PDF for invoice " + invoice.getInvoiceNumber(), e);
            throw new RuntimeException("Failed to generate PDF for invoice " + invoice.getInvoiceNumber(), e);
        } finally {
            try {
                os.close();
            } catch (Exception e) {
                logger.error("Error closing output stream for invoice {}: {}", invoice.getInvoiceNumber(), e.getMessage());
            }
        }
    }
    
    /**
     * Generate HTML content for invoice (can be converted to PDF)
     */
    public String generateInvoiceHTML(Invoice invoice) {
        StringBuilder html = new StringBuilder();
        
        html.append("<!DOCTYPE html>");
        html.append("<html>");
        html.append("<head>");
        html.append("<meta charset='UTF-8'/>");
        html.append("<title>Invoice ").append(invoice.getInvoiceNumber()).append("</title>");
        html.append("<style>");
        html.append(getInvoiceCSS());
        html.append("</style>");
        html.append("</head>");
        html.append("<body>");
        
        // Header
        html.append("<div class='header'>");
        html.append("<h1>ALEDHEMTEK</h1>");
        html.append("<p> Services à domicile</p>");
        html.append("</div>");
        
        // Invoice details
        html.append("<div class='invoice-details'>");
        html.append("<h2>Facture N° ").append(invoice.getInvoiceNumber()).append("</h2>");
        html.append("<p><strong>Date d'émission:</strong> ").append(invoice.getIssueDate().format(DATE_FORMATTER)).append("</p>");
        html.append("<p><strong>Date d'échéance:</strong> ").append(invoice.getDueDate().format(DATE_FORMATTER)).append("</p>");
        html.append("<p><strong>Statut:</strong> ").append(getStatusInFrench(invoice.getStatus())).append("</p>");
        html.append("</div>");
        
        // Client information
        if (invoice.getReservation() != null && invoice.getReservation().getClient() != null) {
            html.append("<div class='client-info'>");
            html.append("<h3>Facturé à:</h3>");
            html.append("<p>").append(invoice.getReservation().getClient().getFirstName())
                .append(" ").append(invoice.getReservation().getClient().getLastName()).append("</p>");
            html.append("<p>").append(invoice.getReservation().getClient().getEmail()).append("</p>");
            html.append("<p>").append(invoice.getReservation().getClient().getPhone()).append("</p>");
            html.append("</div>");
        }
        
        // Items table
        html.append("<table class='items-table'>");
        html.append("<thead>");
        html.append("<tr>");
        html.append("<th>Désignation</th>");
        html.append("<th>Description</th>");
        html.append("<th>Quantité</th>");
        html.append("<th>Prix unitaire</th>");
        html.append("<th>Total</th>");
        html.append("</tr>");
        html.append("</thead>");
        html.append("<tbody>");
        
        for (InvoiceItem item : invoice.getInvoiceItems()) {
            html.append("<tr>");
            html.append("<td>").append(item.getDesignation()).append("</td>");
            html.append("<td>").append(item.getDescription() != null ? item.getDescription() : "").append("</td>");
            html.append("<td>").append(item.getQuantity()).append("</td>");
            html.append("<td>").append(String.format("%.2f €", item.getUnitPrice())).append("</td>");
            html.append("<td>").append(String.format("%.2f €", item.getTotal())).append("</td>");
            html.append("</tr>");
        }
        
        html.append("</tbody>");
        html.append("</table>");
        
        // Totals
        html.append("<div class='totals'>");
        html.append("<p><strong>Montant HT:</strong> ").append(String.format("%.2f €", invoice.getAmountExclTax())).append("</p>");
        html.append("<p><strong>TVA (").append(invoice.getTaxRate()).append("%):</strong> ").append(String.format("%.2f €", invoice.getTaxAmount())).append("</p>");
        html.append("<p class='total'><strong>Montant Total TTC:</strong> ").append(String.format("%.2f €", invoice.getTotalAmount())).append("</p>");
        html.append("</div>");
        
        // Notes
        if (invoice.getNotes() != null && !invoice.getNotes().trim().isEmpty()) {
            html.append("<div class='notes'>");
            html.append("<h3>Notes:</h3>");
            html.append("<p>").append(invoice.getNotes()).append("</p>");
            html.append("</div>");
        }
        
        // Footer
        html.append("<div class='footer'>");
        html.append("<p>Merci pour votre confiance !</p>");
        html.append("<p>ALEDHEMTEK - Service professionnel de réparation d'électroménager</p>");
        html.append("</div>");
        
        html.append("</body>");
        html.append("</html>");
        
        return html.toString();
    }
    

    
    /**
     * Get CSS styles for invoice HTML
     */
    private String getInvoiceCSS() {
        return """
            body {
                font-family: Arial, sans-serif;
                margin: 20px;
                color: #333;
            }
            .header {
                text-align: center;
                border-bottom: 2px solid #007bff;
                padding-bottom: 20px;
                margin-bottom: 30px;
            }
            .header h1 {
                color: #007bff;
                margin: 0;
                font-size: 2.5em;
            }
            .invoice-details {
                margin-bottom: 30px;
            }
            .client-info {
                margin-bottom: 30px;
                padding: 15px;
                background-color: #f8f9fa;
                border-left: 4px solid #007bff;
            }
            .items-table {
                width: 100%;
                border-collapse: collapse;
                margin-bottom: 30px;
            }
            .items-table th,
            .items-table td {
                border: 1px solid #ddd;
                padding: 12px;
                text-align: left;
            }
            .items-table th {
                background-color: #007bff;
                color: white;
            }
            .items-table tr:nth-child(even) {
                background-color: #f2f2f2;
            }
            .totals {
                text-align: right;
                margin-bottom: 30px;
                padding: 20px;
                background-color: #f8f9fa;
                border: 1px solid #ddd;
            }
            .totals .total {
                font-size: 1.2em;
                color: #007bff;
                border-top: 2px solid #007bff;
                padding-top: 10px;
                margin-top: 10px;
            }
            .notes {
                margin-bottom: 30px;
                padding: 15px;
                background-color: #fff3cd;
                border: 1px solid #ffeaa7;
            }
            .footer {
                text-align: center;
                border-top: 1px solid #ddd;
                padding-top: 20px;
                color: #666;
            }
            """;
    }
    
    /**
     * Convert invoice status to French
     */
    private String getStatusInFrench(Invoice.InvoiceStatus status) {
        return switch (status) {
            case PENDING -> "En attente";
            case SENT -> "Envoyée";
            case PAID -> "Payée";
            case CANCELLED -> "Annulée";
            case OVERDUE -> "En retard";
        };
    }
}
