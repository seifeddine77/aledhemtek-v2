package com.aledhemtek.interfaces;

import org.springframework.web.multipart.MultipartFile;

public interface StorageService {
    void init();
    String store(MultipartFile file, String entityType);
}
