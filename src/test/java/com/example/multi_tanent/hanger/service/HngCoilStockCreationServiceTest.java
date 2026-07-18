package com.example.multi_tanent.hanger.service;

import com.example.multi_tanent.hanger.entity.HngCoilStock;
import com.example.multi_tanent.hanger.enums.CoilInspectionStatus;
import com.example.multi_tanent.hanger.enums.CoilStatus;
import com.example.multi_tanent.hanger.repository.HngCoilStockRepository;
import com.example.multi_tanent.purchases.entity.PurGrn;
import com.example.multi_tanent.purchases.entity.PurGrnItem;
import com.example.multi_tanent.spersusers.enitity.Tenant;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Collections;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class HngCoilStockCreationServiceTest {

    @Mock
    private HngCoilStockRepository coilStockRepo;

    @Mock
    private HngCoilNumberGenerator coilNumberGenerator;

    @InjectMocks
    private HngCoilStockCreationService coilStockCreationService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void createFromGrn_ShouldCreateCoils_WhenItemsAreFlaggedAsCoils() {
        // Arrange
        Tenant tenant = Tenant.builder().id(1L).name("Test Tenant").build();
        PurGrn grn = new PurGrn();
        grn.setId(100L);
        grn.setGrnDate(LocalDate.now());

        PurGrnItem item1 = PurGrnItem.builder()
                .id(200L)
                .isHangerCoil(true)
                .coilNo("COIL-2024-0001")
                .heatNo("HEAT-001")
                .netWeightKg(new BigDecimal("100.5000"))
                .ratePerKg(new BigDecimal("50.0000"))
                .build();

        PurGrnItem item2 = PurGrnItem.builder()
                .id(201L)
                .isHangerCoil(false) // Not a coil
                .build();

        grn.setItems(List.of(item1, item2));

        // Act
        coilStockCreationService.createFromGrn(grn, tenant);

        // Assert
        ArgumentCaptor<List<HngCoilStock>> captor = ArgumentCaptor.forClass(List.class);
        verify(coilStockRepo, times(1)).saveAll(captor.capture());

        List<HngCoilStock> savedCoils = captor.getValue();
        assertEquals(1, savedCoils.size());

        HngCoilStock savedCoil = savedCoils.get(0);
        assertEquals("COIL-2024-0001", savedCoil.getCoilNo());
        assertEquals(new BigDecimal("100.5000"), savedCoil.getTotalWeightKg());
        assertEquals(CoilStatus.AVAILABLE, savedCoil.getStatus());
        assertEquals(CoilInspectionStatus.PENDING, savedCoil.getInspectionStatus());
        assertEquals(tenant, savedCoil.getTenant());
        assertEquals(200L, savedCoil.getGrnItemId());
    }

    @Test
    void createFromGrn_ShouldDoNothing_WhenNoCoilItemsExist() {
        // Arrange
        Tenant tenant = new Tenant();
        PurGrn grn = new PurGrn();
        PurGrnItem item = PurGrnItem.builder().isHangerCoil(false).build();
        grn.setItems(List.of(item));

        // Act
        coilStockCreationService.createFromGrn(grn, tenant);

        // Assert
        verify(coilStockRepo, never()).saveAll(any());
    }
}
