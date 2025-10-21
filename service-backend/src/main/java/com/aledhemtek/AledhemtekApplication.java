
package com.aledhemtek;

import com.aledhemtek.model.*;
import com.aledhemtek.repositories.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import java.util.ArrayList;
import java.util.List;

@SpringBootApplication
public class AledhemtekApplication implements CommandLineRunner {

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private CategoryRepository categoryRepository;
    
    @Autowired
    private ServiceRepository serviceRepository;
    
    @Autowired
    private TaskRepository taskRepository;
    
    @Autowired
    private RateRepository rateRepository;

    public static void main(String[] args) {
        SpringApplication.run(AledhemtekApplication.class, args);
    }

    @Override
    public void run(String... args) throws Exception {
        // Seed roles
        if (roleRepository.findByName("ADMIN").isEmpty()) {
            roleRepository.save(new Role(null, "ADMIN"));
        }
        if (roleRepository.findByName("CLIENT").isEmpty()) {
            roleRepository.save(new Role(null, "CLIENT"));
        }
        if (roleRepository.findByName("CONSULTANT").isEmpty()) {
            roleRepository.save(new Role(null, "CONSULTANT"));
        }

        // Seed admin user
        if (userRepository.findByEmail("admin@aledhemtek.com").isEmpty()) {
            Role adminRole = roleRepository.findByName("ADMIN").get();
            User admin = new User();
            admin.setEmail("admin@aledhemtek.com");
            admin.setFirstName("Admin");
            admin.setLastName("User");
            // Use environment variable for admin password, fallback to a stronger default
            String adminPassword = System.getenv("ADMIN_PASSWORD");
            if (adminPassword == null || adminPassword.isEmpty()) {
                adminPassword = "admin"; // Stronger default password
                System.out.println("WARNING: Using default admin password. Please set ADMIN_PASSWORD environment variable for production.");
            }
            admin.setPassword(new BCryptPasswordEncoder().encode(adminPassword));
            List<Role> roles = new ArrayList<>();
            roles.add(adminRole);
            admin.setRoles(roles);
            userRepository.save(admin);
        }
        
        // Créer un client de test
        if (userRepository.findByEmail("client@test.com").isEmpty()) {
            Client client = new Client();
            client.setFirstName("Client");
            client.setLastName("Test");
            client.setEmail("client@test.com");
            client.setPassword(new BCryptPasswordEncoder().encode("client123"));
            client.setPhone("123456789"); // Changed to String for international phone format support
            client.setAddress("123 Rue de Test");
            client.setCity("Paris");
            client.setCountry("France");
            client.setZip(75001); // setZip au lieu de setZipCode
            client.setEnabled(true);
            client.setAccountNonExpired(true);
            client.setAccountNonLocked(true);
            client.setCredentialsNonExpired(true);
            
            // Trouver le rôle CLIENT
            Role clientRole = roleRepository.findByName("CLIENT").orElse(null);
            if (clientRole != null) {
                List<Role> clientRoles = new ArrayList<>();
                clientRoles.add(clientRole);
                client.setRoles(clientRoles);
            }
            
            Client savedClient = userRepository.save(client);
            System.out.println("Client de test créé avec ID: " + savedClient.getId());
        }
        
        // Seed test data
        seedTestData();
        
        // Corriger les noms d'images existants
        fixImageNames();
    }
    
    private void seedTestData() {
        // Créer une catégorie de test
        if (categoryRepository.count() == 0) {
            Category plomberie = new Category();
            plomberie.setName("Plomberie");
            plomberie.setDescription("Services de plomberie");
            plomberie.setImg("plomberie.jpg");
            categoryRepository.save(plomberie);
            
            // Créer un service de test
            Service reparationPlomberie = new Service();
            reparationPlomberie.setName("Réparation Plomberie");
            reparationPlomberie.setDescription("Réparations diverses de plomberie");
            reparationPlomberie.setImg("reparation.jpg");
            reparationPlomberie.setCategory(plomberie);
            serviceRepository.save(reparationPlomberie);
            
            // Créer des tâches de test
            Task reparerRobinet = new Task();
            reparerRobinet.setName("Réparer robinet qui fuit");
            reparerRobinet.setDescription("Réparation d'un robinet qui fuit");
            reparerRobinet.setDuration(30);
            reparerRobinet.setImageName("robinet.jpg");
            reparerRobinet.setService(reparationPlomberie);
            taskRepository.save(reparerRobinet);
            
            // Ajouter un tarif pour cette tâche
            Rate tarif1 = new Rate();
            tarif1.setPrice(45.0);
            tarif1.setStartDate(java.time.LocalDate.now().minusDays(30));
            tarif1.setEndDate(java.time.LocalDate.now().plusDays(365));
            rateRepository.save(tarif1);
            
            // Associer le tarif à la tâche
            tarif1.setTask(reparerRobinet);
            reparerRobinet.getRates().add(tarif1);
            
            // Deuxième tâche
            Task deboucherCanalisation = new Task();
            deboucherCanalisation.setName("Déboucher canalisation");
            deboucherCanalisation.setDescription("Débouchage de canalisation");
            deboucherCanalisation.setDuration(45);
            deboucherCanalisation.setImageName("canalisation.jpg");
            deboucherCanalisation.setService(reparationPlomberie);
            taskRepository.save(deboucherCanalisation);
            
            // Tarif pour la deuxième tâche
            Rate tarif2 = new Rate();
            tarif2.setPrice(60.0);
            tarif2.setStartDate(java.time.LocalDate.now().minusDays(30));
            tarif2.setEndDate(java.time.LocalDate.now().plusDays(365));
            rateRepository.save(tarif2);
            
            tarif2.setTask(deboucherCanalisation);
            deboucherCanalisation.getRates().add(tarif2);
            
            System.out.println("Données de test créées avec succès!");
        }
    }
    
    private void fixImageNames() {
        System.out.println("Correction des noms d'images...");
        
        // Corriger les noms d'images des tâches
        List<Task> tasks = taskRepository.findAll();
        for (Task task : tasks) {
            if (task.getImageName() != null && task.getImageName().startsWith("tasks/")) {
                String newImageName = task.getImageName().substring(6); // Enlever "tasks/"
                task.setImageName(newImageName);
                taskRepository.save(task);
                System.out.println("Tâche " + task.getName() + ": " + task.getImageName() + " -> " + newImageName);
            }
        }
        
        // Corriger les noms d'images des services
        List<Service> services = serviceRepository.findAll();
        for (Service service : services) {
            if (service.getImg() != null && service.getImg().startsWith("services/")) {
                String newImageName = service.getImg().substring(9); // Enlever "services/"
                service.setImg(newImageName);
                serviceRepository.save(service);
                System.out.println("Service " + service.getName() + ": " + service.getImg() + " -> " + newImageName);
            }
        }
        
        // Corriger les noms d'images des catégories
        List<Category> categories = categoryRepository.findAll();
        for (Category category : categories) {
            if (category.getImg() != null && category.getImg().startsWith("categories/")) {
                String newImageName = category.getImg().substring(11); // Enlever "categories/"
                category.setImg(newImageName);
                categoryRepository.save(category);
                System.out.println("Catégorie " + category.getName() + ": " + category.getImg() + " -> " + newImageName);
            }
        }
        
        
    }
}