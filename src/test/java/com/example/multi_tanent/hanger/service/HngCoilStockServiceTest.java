package com.example.multi_tanent.hanger.service;

import com.example.multi_tanent.config.TenantContext;
import com.example.multi_tanent.hanger.dto.HngCoilStockResponse;
import com.example.multi_tanent.hanger.entity.HngCoilStock;
import com.example.multi_tanent.hanger.enums.CoilInspectionStatus;
import com.example.multi_tanent.hanger.enums.CoilStatus;
import com.example.multi_tanent.hanger.repository.HngCoilStockRepository;
import jakarta.persistence.EntityNotFoundException;
import org.junit.jupiter.api.AfterEach;
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
class HngCoilStockServiceTest {

    @Mock
    private HngCoilStockRepository coilStockRepository;

    @InjectMocks
    private HngCoilStockService coilStockService;

    private static final String TENANT_ID = "test-tenant";

    @BeforeEach
    void setUp() {
        TenantContext.setTenantId(TENANT_ID);
    }

    @AfterEach
    void tearDown() {
        TenantContext.clear();
    }

    @Test
    void getAll_ShouldReturnList() {
        HngCoilStock coil = new HngCoilStock();
        coil.setCoilNo("COIL-001");
        coil.setTotalWeightKg(new BigDecimal("1000.0"));
        coil.setRemainingWeightKg(new BigDecimal("1000.0"));

        when(coilStockRepository.findByTenantTenantIdOrderByCreatedAtDesc(TENANT_ID))
                .thenReturn(List.of(coil));

        List<HngCoilStockResponse> result = coilStockService.getAll();

        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals("COIL-001", result.get(0).getCoilNo());
    }

    @Test
    void getAvailableStock_ShouldReturnMergedList() {
        HngCoilStock coil1 = new HngCoilStock();
        coil1.setStatus(CoilStatus.AVAILABLE);
        HngCoilStock coil2 = new HngCoilStock();
        coil2.setStatus(CoilStatus.PARTIAL);

        when(coilStockRepository.findByTenantTenantIdAndStatus(TENANT_ID, CoilStatus.AVAILABLE))
                .thenReturn(new java.util.ArrayList<>(List.of(coil1)));
        when(coilStockRepository.findByTenantTenantIdAndStatus(TENANT_ID, CoilStatus.PARTIAL))
                .thenReturn(new java.util.ArrayList<>(List.of(coil2)));

        List<HngCoilStockResponse> result = coilStockService.getAvailableStock();

        assertNotNull(result);
        assertEquals(2, result.size());
    }

    @Test
    void updateInspectionStatus_ShouldUpdateAndSave() {
        HngCoilStock coil = new HngCoilStock();
        coil.setId(1L);
        coil.setInspectionStatus(CoilInspectionStatus.PENDING);

        when(coilStockRepository.findById(1L)).thenReturn(Optional.of(coil));
        when(coilStockRepository.save(any(HngCoilStock.class))).thenAnswer(invocation -> invocation.getArgument(0));

        HngCoilStockResponse result = coilStockService.updateInspectionStatus(1L, CoilInspectionStatus.APPROVED,
                "Looks good");

        assertNotNull(result);
        assertEquals(CoilInspectionStatus.APPROVED, result.getInspectionStatus());
        assertEquals("Looks good", result.getQcRemarks());
        verify(coilStockRepository, times(1)).save(any(HngCoilStock.class));
    }

    @Test
    void updateInspectionStatus_REJECTED_ShouldSetQuarantine() {
        HngCoilStock coil = new HngCoilStock();
        coil.setId(1L);

        when(coilStockRepository.findById(1L)).thenReturn(Optional.of(coil));
        when(coilStockRepository.save(any(HngCoilStock.class))).thenAnswer(invocation -> invocation.getArgument(0));

        HngCoilStockResponse result = coilStockService.updateInspectionStatus(1L, CoilInspectionStatus.REJECTED,
                "Defective");

        assertEquals(CoilStatus.QUARANTINE, result.getStatus());
    }
}
