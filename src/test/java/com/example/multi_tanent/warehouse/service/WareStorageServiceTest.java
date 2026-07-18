package com.example.multi_tanent.warehouse.service;

import com.example.multi_tanent.config.FileStorageProperties;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.junit.jupiter.api.io.TempDir;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.core.io.Resource;
import org.springframework.mock.web.MockMultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class WareStorageServiceTest {

    @Mock
    private FileStorageProperties storageProperties;

    @TempDir
    Path tempDir;

    private WareStorageService storageService;

    @BeforeEach
    void setUp() {
        when(storageProperties.getUploadDir()).thenReturn(tempDir.toString());
        storageService = new WareStorageService(storageProperties);
    }

    @Test
    void storeProductFile_ShouldSaveFileAndReturnPath() throws IOException {
        String fileName = "test.png";
        byte[] content = "test data".getBytes();
        String tenantId = "tenant1";

        String result = storageService.storeProductFile(content, fileName, tenantId);

        assertNotNull(result);
        assertTrue(result.contains(tenantId));
        assertTrue(result.contains("warehouse/product"));

        Path savedFile = tempDir.resolve(result);
        assertTrue(Files.exists(savedFile));
    }

    @Test
    void storeProductFile_Multipart_ShouldSaveFile() throws IOException {
        MockMultipartFile file = new MockMultipartFile("file", "test.png", "image/png", "data".getBytes());
        String tenantId = "tenant2";

        String result = storageService.storeProductFile(file, tenantId);

        assertNotNull(result);
        assertTrue(Files.exists(tempDir.resolve(result)));
    }

    @Test
    void loadFileAsResource_ShouldReturnResource() throws IOException {
        String relativePath = "tenant1/warehouse/product/test.png";
        Path fullPath = tempDir.resolve(relativePath);
        Files.createDirectories(fullPath.getParent());
        Files.write(fullPath, "data".getBytes());

        Resource resource = storageService.loadFileAsResource(relativePath);

        assertNotNull(resource);
        assertTrue(resource.exists());
    }

    @Test
    void loadFileAsResource_ShouldThrowException_WhenNotFound() {
        assertThrows(RuntimeException.class, () -> storageService.loadFileAsResource("nonexistent.png"));
    }
}
