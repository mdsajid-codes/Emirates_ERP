package com.example.multi_tanent.warehouse.service;

import com.example.multi_tanent.spersusers.enitity.Tenant;
import com.example.multi_tanent.spersusers.repository.TenantRepository;
import com.example.multi_tanent.warehouse.dto.FloorRequest;
import com.example.multi_tanent.warehouse.dto.FloorResponse;
import com.example.multi_tanent.warehouse.entity.Floor;
import com.example.multi_tanent.warehouse.entity.WareHouse;
import com.example.multi_tanent.warehouse.enums.FloorAccessType;
import com.example.multi_tanent.warehouse.repository.FloorRepository;
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
class FloorServiceTest {

    @Mock
    private FloorRepository floorRepository;
    @Mock
    private WareHouseRepository warehouseRepository;
    @Mock
    private TenantRepository tenantRepository;

    @InjectMocks
    private FloorService floorService;

    private Tenant tenant;
    private WareHouse warehouse;
    private Floor floor;

    @BeforeEach
    void setUp() {
        tenant = Tenant.builder().id(1L).tenantId("T1").build();
        warehouse = WareHouse.builder().id(1L).name("W1").build();
        floor = Floor.builder()
                .id(1L)
                .warehouse(warehouse)
                .code("FL-1")
                .name("Floor 1")
                .levelNo(1)
                .isActive(true)
                .build();
    }

    @Test
    void getAllFloors_shouldReturnList() {
        when(tenantRepository.findFirstByOrderByIdAsc()).thenReturn(Optional.of(tenant));
        when(floorRepository.findByWarehouseEnterpriseId(1L)).thenReturn(List.of(floor));

        List<FloorResponse> result = floorService.getAllFloors();

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getCode()).isEqualTo("FL-1");
    }

    @Test
    void getById_shouldReturnResponse() {
        when(tenantRepository.findFirstByOrderByIdAsc()).thenReturn(Optional.of(tenant));
        when(floorRepository.findByIdAndWarehouseEnterpriseId(1L, 1L)).thenReturn(Optional.of(floor));

        FloorResponse result = floorService.getById(1L);

        assertThat(result.getCode()).isEqualTo("FL-1");
    }

    @Test
    void create_shouldSaveFloor() {
        FloorRequest request = FloorRequest.builder()
                .warehouseId(1L)
                .code("FL-1")
                .name("Floor 1")
                .levelNo(1)
                .accessType(FloorAccessType.STAIRS)
                .build();

        when(tenantRepository.findFirstByOrderByIdAsc()).thenReturn(Optional.of(tenant));
        when(warehouseRepository.findByIdAndEnterpriseId(1L, 1L)).thenReturn(Optional.of(warehouse));
        when(floorRepository.save(any(Floor.class))).thenAnswer(invocation -> invocation.getArgument(0));

        FloorResponse result = floorService.create(request);

        assertThat(result.getCode()).isEqualTo("FL-1");
        verify(floorRepository).save(any(Floor.class));
    }

    @Test
    void delete_shouldCallRepository() {
        when(tenantRepository.findFirstByOrderByIdAsc()).thenReturn(Optional.of(tenant));
        when(floorRepository.findByIdAndWarehouseEnterpriseId(1L, 1L)).thenReturn(Optional.of(floor));

        floorService.delete(1L);

        verify(floorRepository).delete(floor);
    }
}
