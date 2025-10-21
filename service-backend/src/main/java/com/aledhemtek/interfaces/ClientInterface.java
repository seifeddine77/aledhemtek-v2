package com.aledhemtek.interfaces;

import org.springframework.web.multipart.MultipartFile;
import com.aledhemtek.dto.ClientDTO;

import java.io.IOException;
import java.util.List;

public interface ClientInterface {
    List<ClientDTO> getAllClients();
    ClientDTO getClientById(Long id);
    ClientDTO createClient(ClientDTO dto, MultipartFile file)throws IOException;
    //ClientDTO createClient(ClientDTO dto);
    ClientDTO updateClient(Long id, ClientDTO dto);
    void deleteClient(Long id);
}
