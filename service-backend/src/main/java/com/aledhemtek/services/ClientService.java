package com.aledhemtek.services;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import com.aledhemtek.dto.ClientDTO;
import com.aledhemtek.interfaces.ClientInterface;
import com.aledhemtek.model.Client;
import com.aledhemtek.model.Role;
import com.aledhemtek.repositories.ClientRepository;
import com.aledhemtek.repositories.RoleRepository;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class ClientService implements ClientInterface {

    private final ClientRepository clientRepository;
    private final PasswordEncoder passwordEncoder;
    private final RoleRepository roleRepository;
    
    public ClientService(ClientRepository clientRepository, PasswordEncoder passwordEncoder, RoleRepository roleRepository) {
        this.clientRepository = clientRepository;
        this.passwordEncoder = passwordEncoder;
        this.roleRepository = roleRepository;
    }
    private ClientDTO mapToDTO(Client clt) {
        ClientDTO dto = new ClientDTO();
        dto.setId(clt.getId());
        dto.setEmail(clt.getEmail());
        dto.setFirstName(clt.getFirstName());
        dto.setLastName(clt.getLastName());
        dto.setPhone(clt.getPhone());
        dto.setDob(clt.getDob());
        dto.setCountry(clt.getCountry());
        dto.setCity(clt.getCity());
        dto.setZip(clt.getZip());
        dto.setAddress(clt.getAddress());
        dto.setPassword(clt.getPassword());
        dto.setProfilePic(clt.getProfilePic());
        return dto;
    }


    private Client mapToEntity(ClientDTO dto) {
        Client clt = new Client();
        clt.setEmail(dto.getEmail());
        clt.setFirstName(dto.getFirstName());
        clt.setLastName(dto.getLastName());
        clt.setPhone(dto.getPhone());
        clt.setDob(dto.getDob());
        clt.setCountry(dto.getCountry());
        clt.setCity(dto.getCity());
        clt.setZip(dto.getZip());
        clt.setAddress(dto.getAddress());
        clt.setPassword(passwordEncoder.encode(dto.getPassword()));
        
        // Assign CLIENT role
        Role clientRole = roleRepository.findByName("CLIENT")
            .orElseThrow(() -> new RuntimeException("CLIENT role not found"));
        List<Role> roles = new ArrayList<>();
        roles.add(clientRole);
        clt.setRoles(roles);
        
        return clt;
    }
    @Override
    public List<ClientDTO> getAllClients() {
        try {
            List<Client> clients = clientRepository.findAll();
            return clients.stream()
                    .map(this::mapToDTO)
                    .collect(Collectors.toList());
        } catch (Exception e) {
            e.printStackTrace();
            return List.of(); // return empty list on error
        }
    }

    @Override
    public ClientDTO getClientById(Long id) {
        try {
            Optional<Client> client = clientRepository.findById(id);
            return client.map(this::mapToDTO).orElse(null);
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
    }

    @Override
    /*public ClientDTO createClient(ClientDTO dto) {
        Client client = mapToEntity(dto);
        client.setPassword(passwordEncoder.encode(dto.getPassword()));  // hash password here!
        Client savedClient = clientRepository.save(client);
        return mapToDTO(savedClient);
    }*/
    public ClientDTO createClient(ClientDTO dto, MultipartFile file) {
        try {
            ObjectMapper mapper = new ObjectMapper();
            System.out.println("🧾 Saving DTO: " + mapper.writeValueAsString(dto));
            System.out.println("📎 File: " + (file != null ? file.getOriginalFilename() : "null"));

            Client client = mapToEntity(dto);

            if (file != null && !file.isEmpty()) {
                String fileName = UUID.randomUUID() + "_" + file.getOriginalFilename();
                                Path uploadPath = Paths.get(System.getProperty("user.dir"), "service-backend", "uploads", "profile-pictures");

                Files.createDirectories(uploadPath);
                file.transferTo(uploadPath.resolve(fileName).toFile());
                client.setProfilePic(fileName);
            }

            client.setPassword(passwordEncoder.encode(dto.getPassword()));
            Client saved = clientRepository.save(client);
            return mapToDTO(saved);

        } catch (Exception e) {
            e.printStackTrace();
            throw new RuntimeException("Error in createClient: " + e.getMessage(), e);
        }
    }



    @Override
    public ClientDTO updateClient(Long id, ClientDTO dto) {
        try {
            Client client = clientRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Client not found"));
            mapToEntity(dto); // update existing entity
            Client updated = clientRepository.save(client);
            return mapToDTO(updated);
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
    }

    @Override
    public void deleteClient(Long id) {

    }
}
