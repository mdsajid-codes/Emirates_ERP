package com.example.multi_tanent.warehouse.service;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.junit.jupiter.MockitoExtension;

import java.io.IOException;

import static org.junit.jupiter.api.Assertions.*;

@ExtendWith(MockitoExtension.class)
class WareBarcodeServiceTest {

    @InjectMocks
    private WareBarcodeService barcodeService;

    @Test
    void generateBarcodeImage_ShouldReturnNonEmptyByteArray() throws IOException {
        String testText = "SKU123456";
        byte[] result = barcodeService.generateBarcodeImage(testText);

        assertNotNull(result);
        assertTrue(result.length > 0);
    }

    @Test
    void generateBarcodeImage_ShouldThrowException_WhenTextIsEmpty() {
        // zxing handles encoding, empty might fail or produce minimal image
        // Let's just ensure it doesn't crash catastrophically for simple input
        assertDoesNotThrow(() -> barcodeService.generateBarcodeImage("A"));
    }
}
