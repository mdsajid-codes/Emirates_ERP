package com.example.multi_tanent.warehouse.service;

import com.example.multi_tanent.warehouse.dto.WareProductSerialRequest;
import com.example.multi_tanent.warehouse.dto.WareProductSerialResponse;
import com.example.multi_tanent.warehouse.entity.WareProductBatch;
import com.example.multi_tanent.warehouse.entity.WareProductSerial;
import com.example.multi_tanent.warehouse.repository.WareProductBatchRepository;
import com.example.multi_tanent.warehouse.repository.WareProductSerialRepository;
import jakarta.persistence.EntityNotFoundException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class WareProductSerialServiceTest {

    @Mock
    private WareProductSerialRepository serialRepository;

    @Mock
    private WareProductBatchRepository batchRepository;

    @InjectMocks
    private WareProductSerialService serialService;

    private WareProductBatch mockBatch;
    private WareProductSerial mockSerial;

    @BeforeEach
    void setUp() {
        mockBatch = WareProductBatch.builder().id(1L).batchNumber("B001").build();
        mockSerial = WareProductSerial.builder()
                .id(1L)
                .serialNumber("SN001")
                .batch(mockBatch)
                .build();
    }

    @Test
    void create_ShouldReturnSerialResponse() {
        WareProductSerialRequest request = WareProductSerialRequest.builder()
                .serialNumber("SN002")
                .batchId(1L)
                .build();

        when(serialRepository.existsBySerialNumber("SN002")).thenReturn(false);
        when(batchRepository.findById(1L)).thenReturn(Optional.of(mockBatch));
        when(serialRepository.save(any(WareProductSerial.class))).thenAnswer(invocation -> {
            WareProductSerial saved = invocation.getArgument(0);
            saved.setId(2L);
            return saved;
        });

        WareProductSerialResponse result = serialService.create(request);

        assertNotNull(result);
        assertEquals("SN002", result.getSerialNumber());
        assertEquals(2L, result.getId());
        verify(serialRepository).save(any(WareProductSerial.class));
    }

    @Test
    void create_ShouldThrowException_WhenSerialExists() {
        WareProductSerialRequest request = WareProductSerialRequest.builder().serialNumber("SN001").build();
        when(serialRepository.existsBySerialNumber("SN001")).thenReturn(true);

        assertThrows(IllegalArgumentException.class, () -> serialService.create(request));
    }

    @Test
    void update_ShouldReturnUpdatedSerialResponse() {
        WareProductSerialRequest request = WareProductSerialRequest.builder()
                .serialNumber("SN001-Updated")
                .batchId(1L)
                .build();

        when(serialRepository.findById(1L)).thenReturn(Optional.of(mockSerial));
        when(serialRepository.existsBySerialNumber("SN001-Updated")).thenReturn(false);
        when(batchRepository.findById(1L)).thenReturn(Optional.of(mockBatch));
        when(serialRepository.save(any(WareProductSerial.class))).thenReturn(mockSerial);

        WareProductSerialResponse result = serialService.update(1L, request);

        assertNotNull(result);
        assertEquals("SN001-Updated", result.getSerialNumber());
        verify(serialRepository).save(any(WareProductSerial.class));
    }

    @Test
    void delete_ShouldCallRepositoryDelete() {
        serialService.delete(1L);
        verify(serialRepository).deleteById(1L);
    }

    @Test
    void findBySerial_ShouldReturnOptionalResponse() {
        when(serialRepository.findBySerialNumber("SN001")).thenReturn(Optional.of(mockSerial));

        Optional<WareProductSerialResponse> result = serialService.findBySerial("SN001");

        assertTrue(result.isPresent());
        assertEquals("SN001", result.get().getSerialNumber());
    }
}
