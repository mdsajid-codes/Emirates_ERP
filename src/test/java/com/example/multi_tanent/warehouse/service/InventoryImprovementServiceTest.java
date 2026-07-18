package com.example.multi_tanent.warehouse.service;

import com.example.multi_tanent.spersusers.enitity.Tenant;
import com.example.multi_tanent.spersusers.repository.TenantRepository;
import com.example.multi_tanent.warehouse.dto.InventoryImprovementRequest;
import com.example.multi_tanent.warehouse.dto.InventoryImprovementResponse;
import com.example.multi_tanent.warehouse.entity.InventoryImprovement;
import com.example.multi_tanent.warehouse.entity.WareHouse;
import com.example.multi_tanent.warehouse.enums.MovementType;
import com.example.multi_tanent.warehouse.enums.StockStatus;
import com.example.multi_tanent.warehouse.repository.InventoryImprovementRepository;
import com.example.multi_tanent.warehouse.repository.WareHouseRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class InventoryImprovementServiceTest {

    @Mock
    private InventoryImprovementRepository inventoryImprovementRepository;
    @Mock
    private WareHouseRepository warehouseRepository;
    @Mock
    private TenantRepository tenantRepository;

    @InjectMocks
    private InventoryImprovementService inventoryImprovementService;

    private Tenant tenant;
    private WareHouse warehouse;
    private InventoryImprovement movement;

    @BeforeEach
    void setUp() {
        tenant = Tenant.builder().id(1L).tenantId("T1").build();
        warehouse = WareHouse.builder().id(1L).name("W1").build();
        movement = InventoryImprovement.builder()
                .id(1L)
                .movementNo("MOV-001")
                .type(MovementType.INWARD)
                .status(StockStatus.AVAILABLE)
                .warehouse(warehouse)
                .quantity(100.0)
                .enterprise(tenant)
                .build();
    }

    @Test
    void getAll_shouldReturnList() {
        when(tenantRepository.findFirstByOrderByIdAsc()).thenReturn(Optional.of(tenant));
        when(inventoryImprovementRepository.findByEnterpriseId(1L)).thenReturn(List.of(movement));

        List<InventoryImprovementResponse> result = inventoryImprovementService.getAll();

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getMovementNo()).isEqualTo("MOV-001");
    }

    @Test
    void getById_shouldReturnResponse() {
        when(tenantRepository.findFirstByOrderByIdAsc()).thenReturn(Optional.of(tenant));
        when(inventoryImprovementRepository.findByIdAndEnterpriseId(1L, 1L)).thenReturn(Optional.of(movement));

        InventoryImprovementResponse result = inventoryImprovementService.getById(1L);

        assertThat(result.getMovementNo()).isEqualTo("MOV-001");
    }

    @Test
    void create_shouldSaveMovement() {
        InventoryImprovementRequest request = InventoryImprovementRequest.builder()
                .movementNo("MOV-001")
                .type(MovementType.INWARD)
                .status(StockStatus.AVAILABLE)
                .warehouseId(1L)
                .quantity(100.0)
                .build();

        when(tenantRepository.findFirstByOrderByIdAsc()).thenReturn(Optional.of(tenant));
        when(warehouseRepository.findById(1L)).thenReturn(Optional.of(warehouse));
        when(inventoryImprovementRepository.save(any(InventoryImprovement.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        InventoryImprovementResponse result = inventoryImprovementService.create(request);

        assertThat(result.getMovementNo()).isEqualTo("MOV-001");
        verify(inventoryImprovementRepository).save(any(InventoryImprovement.class));
    }

    @Test
    void delete_shouldCallRepository() {
        when(tenantRepository.findFirstByOrderByIdAsc()).thenReturn(Optional.of(tenant));
        when(inventoryImprovementRepository.findByIdAndEnterpriseId(1L, 1L)).thenReturn(Optional.of(movement));

        inventoryImprovementService.delete(1L);

        verify(inventoryImprovementRepository).delete(movement);
    }
}
