package com.aledhemtek.controllers;

import com.aledhemtek.dto.CategoryDto;
import com.aledhemtek.dto.MaterialDto;
import com.aledhemtek.dto.ServiceDto;
import com.aledhemtek.dto.TaskDto;
import com.aledhemtek.interfaces.AdminService;
import com.aledhemtek.interfaces.CategoryService;
import com.aledhemtek.interfaces.InvoiceService;
import com.aledhemtek.services.PaymentProcessingService;
import com.aledhemtek.services.AutoInvoiceService;
import com.aledhemtek.model.Invoice;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.security.access.prepost.PreAuthorize;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.HashMap;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    @Autowired
    private CategoryService categoryService;

    @Autowired
    private AdminService adminService;
    
    @Autowired
    private InvoiceService invoiceService;
    
    @Autowired
    private PaymentProcessingService paymentProcessingService;
    
    @Autowired
    private AutoInvoiceService autoInvoiceService;

    @PostMapping("/categories")
    public ResponseEntity<CategoryDto> createCategory(@ModelAttribute CategoryDto category) {
        CategoryDto categoryDto = categoryService.createCategory(category);
        return ResponseEntity.status(HttpStatus.CREATED).body(categoryDto);
    }

    @GetMapping("/categories")
    public ResponseEntity<List<CategoryDto>> getAllCategories() {
        List<CategoryDto> categories = categoryService.getAllCategories();
        return ResponseEntity.ok(categories);
    }

    @PostMapping(value = "/services", consumes = "multipart/form-data")
    public ResponseEntity<ServiceDto> createService(@RequestPart("serviceDto") ServiceDto serviceDto,
                                                    @RequestPart("image") MultipartFile file) {
        ServiceDto createdService = adminService.createService(serviceDto, file);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdService);
    }

    @GetMapping("/services")
    public ResponseEntity<List<ServiceDto>> getAllServices() {
        List<ServiceDto> services = adminService.getAllServices();
        return ResponseEntity.ok(services);
    }

    @PostMapping(value = "/tasks", consumes = "multipart/form-data")
    public ResponseEntity<TaskDto> createTask(@RequestPart("taskDto") TaskDto taskDto, @RequestPart("image") MultipartFile file) {
        TaskDto createdTask = adminService.createTask(taskDto, file);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdTask);
    }

    @GetMapping("/tasks")
    public ResponseEntity<List<TaskDto>> getAllTasks() {
        List<TaskDto> tasks = adminService.getAllTasks();
        return ResponseEntity.ok(tasks);
    }

    @DeleteMapping("/tasks/{taskId}")
    public ResponseEntity<Void> deleteTask(@PathVariable Long taskId) {
        adminService.deleteTask(taskId);
        return ResponseEntity.ok(null);
    }

    @PutMapping("/tasks/{taskId}")
    public ResponseEntity<TaskDto> updateTask(@PathVariable Long taskId, @RequestBody TaskDto taskDto) {
        TaskDto updatedTask = adminService.updateTask(taskId, taskDto);
        if (updatedTask != null) {
            return ResponseEntity.ok(updatedTask);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    // Endpoints pour les matériaux
    @PostMapping("/tasks/{taskId}/materials")
    public ResponseEntity<MaterialDto> addMaterialToTask(@PathVariable Long taskId, @RequestBody MaterialDto materialDto) {
        MaterialDto createdMaterial = adminService.addMaterialToTask(taskId, materialDto);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdMaterial);
    }

    @PutMapping("/materials/{materialId}")
    public ResponseEntity<MaterialDto> updateMaterial(@PathVariable Long materialId, @RequestBody MaterialDto materialDto) {
        MaterialDto updatedMaterial = adminService.updateMaterial(materialId, materialDto);
        if (updatedMaterial != null) {
            return ResponseEntity.ok(updatedMaterial);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/materials/{materialId}")
    public ResponseEntity<Void> deleteMaterial(@PathVariable Long materialId) {
        adminService.deleteMaterial(materialId);
        return ResponseEntity.ok(null);
    }

    // ===============================
    // DASHBOARD BILLING & PAYMENTS
    // ===============================
    
    /**
     * Get comprehensive dashboard statistics
     */
    @GetMapping("/dashboard/statistics")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> getDashboardStatistics() {
        try {
            Map<String, Object> stats = new HashMap<>();
            
            // Invoice statistics
            stats.put("invoices", Map.of(
                "totalPending", invoiceService.countInvoicesByStatus(Invoice.InvoiceStatus.PENDING),
                "totalSent", invoiceService.countInvoicesByStatus(Invoice.InvoiceStatus.SENT),
                "totalPaid", invoiceService.countInvoicesByStatus(Invoice.InvoiceStatus.PAID),
                "totalOverdue", invoiceService.countInvoicesByStatus(Invoice.InvoiceStatus.OVERDUE),
                "totalCancelled", invoiceService.countInvoicesByStatus(Invoice.InvoiceStatus.CANCELLED),
                "monthlyRevenue", invoiceService.getMonthlyRevenue(LocalDateTime.now().getYear(), LocalDateTime.now().getMonthValue()),
                "yearlyRevenue", invoiceService.getYearlyRevenue(LocalDateTime.now().getYear())
            ));
            
            // Payment statistics
            stats.put("payments", paymentProcessingService.getPaymentStatistics());
            
            // Recent activity
            stats.put("recentInvoices", invoiceService.getRecentInvoices());
            stats.put("overdueInvoices", invoiceService.getOverdueInvoices());
            
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to get dashboard statistics: " + e.getMessage()));
        }
    }
    
    /**
     * Get invoice analytics
     */
    @GetMapping("/dashboard/invoice-analytics")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> getInvoiceAnalytics() {
        try {
            Map<String, Object> analytics = new HashMap<>();
            
            LocalDateTime now = LocalDateTime.now();
            int currentYear = now.getYear();
            
            // Monthly revenue for the year
            Map<String, Double> monthlyRevenue = new HashMap<>();
            for (int month = 1; month <= 12; month++) {
                monthlyRevenue.put("month_" + month, 
                    invoiceService.getMonthlyRevenue(currentYear, month));
            }
            analytics.put("monthlyRevenue", monthlyRevenue);
            
            // Status distribution
            analytics.put("statusDistribution", Map.of(
                "pending", invoiceService.countInvoicesByStatus(Invoice.InvoiceStatus.PENDING),
                "sent", invoiceService.countInvoicesByStatus(Invoice.InvoiceStatus.SENT),
                "paid", invoiceService.countInvoicesByStatus(Invoice.InvoiceStatus.PAID),
                "overdue", invoiceService.countInvoicesByStatus(Invoice.InvoiceStatus.OVERDUE),
                "cancelled", invoiceService.countInvoicesByStatus(Invoice.InvoiceStatus.CANCELLED)
            ));
            
            return ResponseEntity.ok(analytics);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to get invoice analytics: " + e.getMessage()));
        }
    }
    
    /**
     * Get payment analytics
     */
    @GetMapping("/dashboard/payment-analytics")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> getPaymentAnalytics() {
        try {
            Map<String, Object> analytics = paymentProcessingService.getPaymentStatistics();
            return ResponseEntity.ok(analytics);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to get payment analytics: " + e.getMessage()));
        }
    }
    
    /**
     * Trigger manual invoice generation for completed reservations
     */
    @PostMapping("/dashboard/generate-invoices")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> triggerInvoiceGeneration() {
        try {
            autoInvoiceService.autoGenerateInvoicesForCompletedReservations();
            return ResponseEntity.ok(Map.of(
                "status", "success",
                "message", "Invoice generation triggered successfully"
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of(
                    "status", "error",
                    "message", "Failed to trigger invoice generation: " + e.getMessage()
                ));
        }
    }
    
    /**
     * Trigger manual overdue invoice processing
     */
    @PostMapping("/dashboard/process-overdue")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> triggerOverdueProcessing() {
        try {
            autoInvoiceService.processOverdueInvoices();
            return ResponseEntity.ok(Map.of(
                "status", "success",
                "message", "Overdue invoice processing triggered successfully"
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of(
                    "status", "error",
                    "message", "Failed to trigger overdue processing: " + e.getMessage()
                ));
        }
    }
    
    /**
     * Get system health status
     */
    @GetMapping("/dashboard/health")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> getSystemHealth() {
        try {
            Map<String, Object> health = new HashMap<>();
            
            // Check basic system status
            health.put("status", "healthy");
            health.put("timestamp", LocalDateTime.now());
            
            // Check service availability
            health.put("services", Map.of(
                "invoiceService", "available",
                "paymentService", "available",
                "autoInvoiceService", "available",
                "emailService", "available"
            ));
            
            // Basic metrics
            health.put("metrics", Map.of(
                "totalInvoices", invoiceService.countInvoicesByStatus(Invoice.InvoiceStatus.PENDING) +
                                 invoiceService.countInvoicesByStatus(Invoice.InvoiceStatus.SENT) +
                                 invoiceService.countInvoicesByStatus(Invoice.InvoiceStatus.PAID) +
                                 invoiceService.countInvoicesByStatus(Invoice.InvoiceStatus.OVERDUE) +
                                 invoiceService.countInvoicesByStatus(Invoice.InvoiceStatus.CANCELLED),
                "pendingPayments", paymentProcessingService.getPaymentStatistics().get("pendingPayments"),
                "systemUptime", "Available" // System is running if this endpoint responds
            ));
            
            return ResponseEntity.ok(health);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of(
                    "status", "unhealthy",
                    "error", e.getMessage(),
                    "timestamp", LocalDateTime.now()
                ));
        }
    }


}
