package com.aledhemtek.services;

import com.aledhemtek.model.Invoice;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import java.io.File;
import org.springframework.core.io.ByteArrayResource;

@Service
public class EmailService {
    
    private static final Logger logger = LoggerFactory.getLogger(EmailService.class);
    
    @Autowired
    private JavaMailSender mailSender;
    
    @Value("${spring.mail.username}")
    private String fromEmail;
    
    @Value("${app.company.name:AledhemTek}")
    private String companyName;
    
    /**
     * Send invoice email to client
     */
        /**
     * Send invoice email with PDF attachment as byte array
     */
    public boolean sendInvoiceEmail(Invoice invoice, byte[] pdfAttachment) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true);
            
            String clientEmail = invoice.getReservation().getClient().getEmail();
            String clientName = invoice.getReservation().getClient().getFirstName() + " " + 
                              invoice.getReservation().getClient().getLastName();
            
            helper.setFrom(fromEmail);
            helper.setTo(clientEmail);
            helper.setSubject("Facture " + invoice.getInvoiceNumber() + " - " + companyName);
            
            String emailContent = buildInvoiceEmailContent(invoice, clientName);
            helper.setText(emailContent, true);
            
            // Attach PDF from byte array
            if (pdfAttachment != null && pdfAttachment.length > 0) {
                helper.addAttachment("Facture_" + invoice.getInvoiceNumber() + ".pdf", new ByteArrayResource(pdfAttachment));
            }
            
            mailSender.send(message);
            logger.info("Invoice email with PDF attachment sent successfully to: {}", clientEmail);
            return true;
            
        } catch (MessagingException e) {
            logger.error("Failed to send invoice email with PDF attachment: {}", e.getMessage());
            return false;
        }
    }

    public boolean sendInvoiceEmail(Invoice invoice) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true);
            
            String clientEmail = invoice.getReservation().getClient().getEmail();
            String clientName = invoice.getReservation().getClient().getFirstName() + " " + 
                              invoice.getReservation().getClient().getLastName();
            
            helper.setFrom(fromEmail);
            helper.setTo(clientEmail);
            helper.setSubject("Facture " + invoice.getInvoiceNumber() + " - " + companyName);
            
            String emailContent = buildInvoiceEmailContent(invoice, clientName);
            helper.setText(emailContent, true);
            
            // Attach PDF if available
            if (invoice.getPdfPath() != null && !invoice.getPdfPath().isEmpty()) {
                File pdfFile = new File(invoice.getPdfPath());
                if (pdfFile.exists()) {
                    helper.addAttachment("Facture_" + invoice.getInvoiceNumber() + ".pdf", pdfFile);
                }
            }
            
            mailSender.send(message);
            logger.info("Invoice email sent successfully to: {}", clientEmail);
            return true;
            
        } catch (MessagingException e) {
            logger.error("Failed to send invoice email: {}", e.getMessage());
            return false;
        }
    }
    
    /**
     * Send payment reminder email
     */
    public boolean sendReminderEmail(Invoice invoice) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true);
            
            String clientEmail = invoice.getReservation().getClient().getEmail();
            String clientName = invoice.getReservation().getClient().getFirstName() + " " + 
                              invoice.getReservation().getClient().getLastName();
            
            helper.setFrom(fromEmail);
            helper.setTo(clientEmail);
            helper.setSubject("Rappel - Facture " + invoice.getInvoiceNumber() + " en retard - " + companyName);
            
            String emailContent = buildReminderEmailContent(invoice, clientName);
            helper.setText(emailContent, true);
            
            mailSender.send(message);
            logger.info("Reminder email sent successfully to: {}", clientEmail);
            return true;
            
        } catch (MessagingException e) {
            logger.error("Failed to send reminder email: {}", e.getMessage());
            return false;
        }
    }
    
    /**
     * Send payment confirmation email
     */
    public boolean sendPaymentConfirmationEmail(Invoice invoice) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            
            String clientEmail = invoice.getReservation().getClient().getEmail();
            String clientName = invoice.getReservation().getClient().getFirstName() + " " + 
                              invoice.getReservation().getClient().getLastName();
            
            message.setFrom(fromEmail);
            message.setTo(clientEmail);
            message.setSubject("Confirmation de paiement - Facture " + invoice.getInvoiceNumber());
            
            String content = String.format(
                "Bonjour %s,\n\n" +
                "Nous vous confirmons la réception de votre paiement pour la facture %s.\n\n" +
                "Montant payé: %.2f €\n" +
                "Date de paiement: %s\n\n" +
                "Merci pour votre confiance.\n\n" +
                "Cordialement,\n" +
                "L'équipe %s",
                clientName,
                invoice.getInvoiceNumber(),
                invoice.getTotalAmount(),
                java.time.LocalDateTime.now().format(java.time.format.DateTimeFormatter.ofPattern("dd/MM/yyyy")),
                companyName
            );
            
            message.setText(content);
            mailSender.send(message);
            logger.info("Payment confirmation email sent successfully to: {}", clientEmail);
            return true;
            
        } catch (Exception e) {
            logger.error("Failed to send payment confirmation email: {}", e.getMessage());
            return false;
        }
    }
    
    /**
     * Build invoice email content
     */
    private String buildInvoiceEmailContent(Invoice invoice, String clientName) {
        return String.format("""
            <html>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                    <h2 style="color: #2c3e50;">Nouvelle facture - %s</h2>
                    
                    <p>Bonjour <strong>%s</strong>,</p>
                    
                    <p>Veuillez trouver ci-joint votre facture <strong>%s</strong> d'un montant de <strong>%.2f €</strong>.</p>
                    
                    <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
                        <h3 style="margin-top: 0; color: #495057;">Détails de la facture :</h3>
                        <ul style="margin: 0; padding-left: 20px;">
                            <li><strong>Numéro :</strong> %s</li>
                            <li><strong>Date d'émission :</strong> %s</li>
                            <li><strong>Date d'échéance :</strong> %s</li>
                            <li><strong>Montant total :</strong> %.2f €</li>
                        </ul>
                    </div>
                    
                    <p>Le paiement est attendu avant le <strong>%s</strong>.</p>
                    
                    <p>Pour toute question concernant cette facture, n'hésitez pas à nous contacter.</p>
                    
                    <p style="margin-top: 30px;">
                        Cordialement,<br>
                        <strong>L'équipe %s</strong>
                    </p>
                    
                    <hr style="border: none; border-top: 1px solid #dee2e6; margin: 30px 0;">
                    <p style="font-size: 12px; color: #6c757d; text-align: center;">
                        Cet email a été envoyé automatiquement, merci de ne pas y répondre.
                    </p>
                </div>
            </body>
            </html>
            """,
            companyName,
            clientName,
            invoice.getInvoiceNumber(),
            invoice.getTotalAmount(),
            invoice.getInvoiceNumber(),
            invoice.getIssueDate().format(java.time.format.DateTimeFormatter.ofPattern("dd/MM/yyyy")),
            invoice.getDueDate().format(java.time.format.DateTimeFormatter.ofPattern("dd/MM/yyyy")),
            invoice.getTotalAmount(),
            invoice.getDueDate().format(java.time.format.DateTimeFormatter.ofPattern("dd/MM/yyyy")),
            companyName
        );
    }
    
    /**
     * Build reminder email content
     */
    private String buildReminderEmailContent(Invoice invoice, String clientName) {
        long daysOverdue = java.time.temporal.ChronoUnit.DAYS.between(
            invoice.getDueDate().toLocalDate(), 
            java.time.LocalDate.now()
        );
        
        return String.format("""
            <html>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                    <h2 style="color: #dc3545;">Rappel - Facture en retard</h2>
                    
                    <p>Bonjour <strong>%s</strong>,</p>
                    
                    <p>Nous vous informons que votre facture <strong>%s</strong> est en retard de <strong>%d jour(s)</strong>.</p>
                    
                    <div style="background-color: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0;">
                        <h3 style="margin-top: 0; color: #856404;">Détails de la facture en retard :</h3>
                        <ul style="margin: 0; padding-left: 20px;">
                            <li><strong>Numéro :</strong> %s</li>
                            <li><strong>Date d'échéance :</strong> %s</li>
                            <li><strong>Montant dû :</strong> %.2f €</li>
                            <li><strong>Jours de retard :</strong> %d</li>
                        </ul>
                    </div>
                    
                    <p><strong>Merci de procéder au règlement dans les plus brefs délais.</strong></p>
                    
                    <p>Si vous avez déjà effectué le paiement, merci de nous en informer.</p>
                    
                    <p style="margin-top: 30px;">
                        Cordialement,<br>
                        <strong>L'équipe %s</strong>
                    </p>
                    
                    <hr style="border: none; border-top: 1px solid #dee2e6; margin: 30px 0;">
                    <p style="font-size: 12px; color: #6c757d; text-align: center;">
                        Cet email a été envoyé automatiquement, merci de ne pas y répondre.
                    </p>
                </div>
            </body>
            </html>
            """,
            clientName,
            invoice.getInvoiceNumber(),
            daysOverdue,
            invoice.getInvoiceNumber(),
            invoice.getDueDate().format(java.time.format.DateTimeFormatter.ofPattern("dd/MM/yyyy")),
            invoice.getRemainingAmount(),
            daysOverdue,
            companyName
        );
    }
}
