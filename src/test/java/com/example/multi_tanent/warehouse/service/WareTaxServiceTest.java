package com.example.multi_tanent.warehouse.service;

import com.example.multi_tanent.spersusers.enitity.Tenant;
import com.example.multi_tanent.spersusers.repository.TenantRepository;
import com.example.multi_tanent.warehouse.dto.WareTaxRequest;
import com.example.multi_tanent.warehouse.dto.WareTaxResponse;
import com.example.multi_tanent.warehouse.entity.WareTax;
import com.example.multi_tanent.warehouse.repository.WareTaxRepository;
import jakarta.persistence.EntityNotFoundException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class WareTaxServiceTest {

    @Mock
    private WareTaxRepository taxRepository;
    @Mock
    private TenantRepository tenantRepository;

    @InjectMocks
    private WareTaxService taxService;

    private Tenant mockTenant;
    private WareTax mockTax;

    @BeforeEach
    void setUp() {
        mockTenant = Tenant.builder().id(1L).name("Mock Tenant").build();
        mockTax = WareTax.builder()
                .id(1L)
                .name("VAT")
                .percentage(new BigDecimal("15.0"))
                .enterprise(mockTenant)
                .build();
    }

    @Test
    void list_ShouldReturnTaxResponses() {
        when(tenantRepository.findFirstByOrderByIdAsc()).thenReturn(Optional.of(mockTenant));
        when(taxRepository.findByEnterpriseId(1L)).thenReturn(List.of(mockTax));

        List<WareTaxResponse> result = taxService.list();

        assertEquals(1, result.size());
        assertEquals("VAT", result.get(0).getName());
    }

    @Test
    void create_ShouldReturnResponse() {
        WareTaxRequest request = WareTaxRequest.builder()
                .name("GST")
                .percentage(new BigDecimal("5.0"))
                .build();

        when(tenantRepository.findFirstByOrderByIdAsc()).thenReturn(Optional.of(mockTenant));
        when(taxRepository.save(any(WareTax.class))).thenReturn(mockTax);

        WareTaxResponse result = taxService.create(request);

        assertNotNull(result);
        verify(taxRepository).save(any(WareTax.class));
    }

    @Test
    void update_ShouldReturnUpdatedResponse() {
        WareTaxRequest request = WareTaxRequest.builder().name("VAT Updated").percentage(new BigDecimal("16.0"))
                .build();
        when(taxRepository.findById(1L)).thenReturn(Optional.of(mockTax));
        when(taxRepository.save(any(WareTax.class))).thenReturn(mockTax);

        WareTaxResponse result = taxService.update(1L, request);

        assertEquals("VAT Updated", result.getName());
    }

    @Test
    void update_ShouldThrow_WhenNotFound() {
        when(taxRepository.findById(99L)).thenReturn(Optional.empty());
        assertThrows(EntityNotFoundException.class, () -> taxService.update(99L, new WareTaxRequest()));
    }

    @Test
    void delete_ShouldCallRepository() {
        taxService.delete(1L);
        verify(taxRepository).deleteById(1L);
    }
}
