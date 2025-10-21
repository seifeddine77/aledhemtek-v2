package com.aledhemtek.controllers;

import com.aledhemtek.utils.InputValidator;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import com.aledhemtek.dto.ClientDTO;
import com.aledhemtek.services.ClientService;
import com.aledhemtek.interfaces.InvoiceService;

import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/clients")
public class ClientController {
    @Autowired
    private ClientService clientService;
    
    @Autowired
    private InputValidator inputValidator;
    private final InvoiceService invoiceService;

    public ClientController(ClientService clientService, InvoiceService invoiceService) {
        this.clientService = clientService;
        this.invoiceService = invoiceService;
    }
    @GetMapping("get-all-clients")
    public ResponseEntity<?> getAllClients() {
        try {
            List<ClientDTO> clients = clientService.getAllClients();
            return ResponseEntity.ok(clients);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to fetch clients"));
        }
    }

    @GetMapping("get-client/{id}")
    public ResponseEntity<?> getClientById(@PathVariable Long id) {
        try {
            ClientDTO client = clientService.getClientById(id);
            if (client != null) {
                return ResponseEntity.ok(client);
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("error", "Client not found"));
            }
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to fetch client"));
        }
    }
    //update Profile
    @PutMapping("update-client/{id}")
    public ResponseEntity<?> updateClient(@PathVariable Long id, @RequestBody ClientDTO dto) {
        try {
            ClientDTO updated = clientService.updateClient(id, dto);
            if (updated != null) {
                return ResponseEntity.ok(updated);
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("error", "Client not found"));
            }
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to update client"));
        }
    }

    // register client
    /*@PostMapping("/save-client")
    public ResponseEntity<?> saveClient(@ModelAttribute ClientDTO dto) {
        clientService.createClient(dto);
        return ResponseEntity.ok().build();
    }*/
    @PostMapping("/save-client")
    public ResponseEntity<Map<String, Object>> registerClient(
            @RequestParam("firstName") String firstName,
            @RequestParam("lastName") String lastName,
            @RequestParam("email") String email,
            @RequestParam("password") String password,
            @RequestParam(value = "phone", required = false) String phone,
            @RequestParam(value = "dob", required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) Date dob,
            @RequestParam(value = "country", required = false) String country,
            @RequestParam(value = "city", required = false) String city,
            @RequestParam(value = "zip", required = false) String zip,
            @RequestParam(value = "address", required = false) String address,
            @RequestParam(value = "profilePic", required = false) MultipartFile profilePic
    ) {
        try {
            if (firstName == null || lastName == null || email == null || password == null) {
                Map<String, Object> error = new HashMap<>();
                error.put("message", "Missing required fields");
                return ResponseEntity.badRequest().body(error);
            }
            
            // Validate email format
            if (!inputValidator.isValidEmail(email)) {
                Map<String, Object> error = new HashMap<>();
                error.put("message", "Invalid email format");
                return ResponseEntity.badRequest().body(error);
            }
            
            // Validate password strength
            if (!inputValidator.isStrongPassword(password)) {
                Map<String, Object> error = new HashMap<>();
                error.put("message", "Password must be at least 8 characters with uppercase, lowercase, number and special character");
                return ResponseEntity.badRequest().body(error);
            }
            
            // Sanitize inputs
            firstName = inputValidator.sanitizeInput(firstName);
            lastName = inputValidator.sanitizeInput(lastName);
            address = inputValidator.sanitizeInput(address);
            city = inputValidator.sanitizeInput(city);
            country = inputValidator.sanitizeInput(country);

            ClientDTO dto = new ClientDTO();
            dto.setFirstName(firstName);
            dto.setLastName(lastName);
            dto.setEmail(email);
            dto.setPassword(password);
            dto.setCity(city);
            dto.setCountry(country);
            dto.setAddress(address);
            dto.setDob(dob);
            dto.setPhone(phone);
            try {
                if (zip != null) {
                    dto.setZip(Integer.parseInt(zip));
                }
            } catch (NumberFormatException ex) {
                Map<String, Object> error = new HashMap<>();
                error.put("message", "Invalid zip format");
                error.put("error", ex.getMessage());
                return ResponseEntity.badRequest().body(error);
            }

            ClientDTO savedClient = clientService.createClient(dto, profilePic);

            Map<String, Object> success = new HashMap<>();
            success.put("message", "Client registered successfully");
            success.put("client", savedClient);
            return ResponseEntity.status(HttpStatus.CREATED).body(success);


        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("message", "Unexpected error");
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    //delete account
    @DeleteMapping("delete-client/{id}")
    public ResponseEntity<?> deleteClient(@PathVariable Long id) {
        try {
            clientService.deleteClient(id);
            return ResponseEntity.ok(Map.of("message", "Client deleted successfully"));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to delete client"));
        }
    }

    // Get client invoices
    @GetMapping("{clientId}/invoices")
    @PreAuthorize("hasRole('ADMIN') or (hasRole('CLIENT') and #clientId == authentication.principal.user.id)")
    public ResponseEntity<?> getClientInvoices(@PathVariable Long clientId) {
        try {
            var invoices = invoiceService.getInvoicesByClientId(clientId);
            return ResponseEntity.ok(invoices);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to fetch client invoices"));
        }
    }
}
