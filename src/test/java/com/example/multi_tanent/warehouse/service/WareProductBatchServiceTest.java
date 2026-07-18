package com.example.multi_tanent.warehouse.service;

import com.example.multi_tanent.warehouse.dto.WareProductBatchRequest;
import com.example.multi_tanent.warehouse.dto.WareProductBatchResponse;
import com.example.multi_tanent.warehouse.entity.WareProductBatch;
import com.example.multi_tanent.warehouse.entity.WareProducts;
import com.example.multi_tanent.warehouse.repository.WareProductBatchRepository;
import com.example.multi_tanent.warehouse.repository.WareProductsRepository;
import jakarta.persistence.EntityNotFoundException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class WareProductBatchServiceTest {

    @Mock
    private WareProductBatchRepository batchRepository;

    @Mock
    private WareProductsRepository productRepository;

    @InjectMocks
    private WareProductBatchService batchService;

    private WareProducts mockProduct;
    private WareProductBatch mockBatch;

    @BeforeEach
    void setUp() {
        mockProduct = WareProducts.builder().id(1L).name("Test Product").build();
        mockBatch = WareProductBatch.builder()
                .id(1L)
                .batchNumber("B001")
                .product(mockProduct)
                .mfgDate(LocalDate.now())
                .expiryDate(LocalDate.now().plusYears(1))
                .build();
    }

    @Test
    void listByProduct_ShouldReturnBatchResponses() {
        when(batchRepository.findByProductId(1L)).thenReturn(List.of(mockBatch));

        List<WareProductBatchResponse> result = batchService.listByProduct(1L);

        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals("B001", result.get(0).getBatchNumber());
        verify(batchRepository).findByProductId(1L);
    }

    @Test
    void create_ShouldReturnBatchResponse() {
        WareProductBatchRequest request = WareProductBatchRequest.builder()
                .productId(1L)
                .batchNumber("B002")
                .mfgDate(LocalDate.now())
                .expiryDate(LocalDate.now().plusYears(1))
                .build();

        when(productRepository.findById(1L)).thenReturn(Optional.of(mockProduct));
        when(batchRepository.save(any(WareProductBatch.class))).thenAnswer(invocation -> {
            WareProductBatch saved = invocation.getArgument(0);
            saved.setId(2L);
            return saved;
        });

        WareProductBatchResponse result = batchService.create(request);

        assertNotNull(result);
        assertEquals("B002", result.getBatchNumber());
        assertEquals(2L, result.getId());
        verify(batchRepository).save(any(WareProductBatch.class));
    }

    @Test
    void create_ShouldThrowException_WhenProductNotFound() {
        WareProductBatchRequest request = WareProductBatchRequest.builder().productId(1L).build();
        when(productRepository.findById(1L)).thenReturn(Optional.empty());

        assertThrows(EntityNotFoundException.class, () -> batchService.create(request));
    }

    @Test
    void update_ShouldReturnUpdatedBatchResponse() {
        WareProductBatchRequest request = WareProductBatchRequest.builder()
                .productId(1L)
                .batchNumber("B001-Updated")
                .build();

        when(batchRepository.findById(1L)).thenReturn(Optional.of(mockBatch));
        when(productRepository.findById(1L)).thenReturn(Optional.of(mockProduct));
        when(batchRepository.save(any(WareProductBatch.class))).thenReturn(mockBatch);

        WareProductBatchResponse result = batchService.update(1L, request);

        assertNotNull(result);
        assertEquals("B001-Updated", result.getBatchNumber());
        verify(batchRepository).save(any(WareProductBatch.class));
    }

    @Test
    void delete_ShouldCallRepositoryDelete() {
        batchService.delete(1L);
        verify(batchRepository).deleteById(1L);
    }
}
