package com.aledhemtek.security;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;

import java.nio.file.Path;
import java.nio.file.Paths;

import static org.junit.jupiter.api.Assertions.*;

class PathTraversalSecurityTest {

    private boolean isUnsafeFilename(String filename) {
        return filename == null || filename.contains("..") || filename.contains("/") || filename.contains("\\");
    }

    private boolean isWithinDirectory(Path baseDir, String filename) {
        Path resolved = baseDir.resolve(filename).normalize().toAbsolutePath();
        return resolved.startsWith(baseDir.normalize().toAbsolutePath());
    }

    @ParameterizedTest
    @ValueSource(strings = {
        "../secret.txt",
        "../../etc/passwd",
        "..\\windows\\win.ini",
        "uploads/../../app.jar",
        "/etc/shadow",
        "C:\\Windows\\System32\\calc.exe",
        "....//....//config.json"
    })
    void testPathTraversalFilenamesRejected(String maliciousFilename) {
        assertTrue(isUnsafeFilename(maliciousFilename), "Malicious filename should be flagged as unsafe: " + maliciousFilename);
    }

    @ParameterizedTest
    @ValueSource(strings = {
        "cv-john-doe.pdf",
        "d8b72511-abcd-ef01.pdf",
        "scan_document_2026.png"
    })
    void testSafeFilenamesAccepted(String safeFilename) {
        assertFalse(isUnsafeFilename(safeFilename), "Safe filename should not be flagged: " + safeFilename);

        Path baseDir = Paths.get("uploads", "resumes");
        assertTrue(isWithinDirectory(baseDir, safeFilename), "Safe file should be strictly confined within baseDir");
    }
}
