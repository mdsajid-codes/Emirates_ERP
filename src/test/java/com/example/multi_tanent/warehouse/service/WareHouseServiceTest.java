package com.example.multi_tanent.warehouse.service;

import com.example.multi_tanent.spersusers.enitity.Location;
import com.example.multi_tanent.spersusers.enitity.Tenant;
import com.example.multi_tanent.spersusers.repository.LocationRepository;
import com.example.multi_tanent.spersusers.repository.TenantRepository;
import com.example.multi_tanent.warehouse.dto.WareHouseRequest;
import com.example.multi_tanent.warehouse.dto.WareHouseResponse;
import com.example.multi_tanent.warehouse.entity.WareHouse;
import com.example.multi_tanent.warehouse.enums.WarehouseType;
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
class WareHouseServiceTest {

    @Mock
    private WareHouseRepository warehouseRepository;
    @Mock
    private LocationRepository locationRepository;
    @Mock
    private TenantRepository tenantRepository;

    @InjectMocks
    private WareHouseService warehouseService;

    private Tenant tenant;
    private Location location;
    private WareHouse warehouse;

    @BeforeEach
    void setUp() {
        tenant = Tenant.builder().id(1L).tenantId("T1").build();

        location = new Location();
        location.setId(1L);
        location.setName("LOC1");

        warehouse = WareHouse.builder()
                .id(1L)
                .code("W001")
                .name("Main Warehouse")
                .isActive(true)
                .enterprise(tenant)
                .location(location)
                .warehouseType(WarehouseType.NORMAL)
                .build();
    }

    @Test
    void getAllWarehouses_shouldReturnList() {
        when(tenantRepository.findFirstByOrderByIdAsc()).thenReturn(Optional.of(tenant));
        when(warehouseRepository.findByEnterpriseId(1L)).thenReturn(List.of(warehouse));

        List<WareHouseResponse> result = warehouseService.getAllWarehouses();

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getCode()).isEqualTo("W001");
    }

    @Test
    void getById_shouldReturnResponse() {
        when(tenantRepository.findFirstByOrderByIdAsc()).thenReturn(Optional.of(tenant));
        when(warehouseRepository.findByIdAndEnterpriseId(1L, 1L)).thenReturn(Optional.of(warehouse));

        WareHouseResponse result = warehouseService.getById(1L);

        assertThat(result.getCode()).isEqualTo("W001");
    }

    @Test
    void getByCode_shouldReturnResponse() {
        when(tenantRepository.findFirstByOrderByIdAsc()).thenReturn(Optional.of(tenant));
        when(warehouseRepository.findByCodeAndEnterpriseId("W001", 1L)).thenReturn(Optional.of(warehouse));

        WareHouseResponse result = warehouseService.getByCode("W001");

        assertThat(result.getName()).isEqualTo("Main Warehouse");
    }

    @Test
    void fetchByActive_shouldReturnList() {
        when(tenantRepository.findFirstByOrderByIdAsc()).thenReturn(Optional.of(tenant));
        when(warehouseRepository.findByIsActiveAndEnterpriseId(true, 1L)).thenReturn(List.of(warehouse));

        List<WareHouseResponse> result = warehouseService.fetchByActive(true);

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getIsActive()).isTrue();
    }

    @Test
    void fetchByWarehouseType_shouldReturnList() {
        when(tenantRepository.findFirstByOrderByIdAsc()).thenReturn(Optional.of(tenant));
        when(warehouseRepository.findByWarehouseTypeAndEnterpriseId(WarehouseType.NORMAL, 1L))
                .thenReturn(List.of(warehouse));

        List<WareHouseResponse> result = warehouseService.fetchByWarehouseType(WarehouseType.NORMAL);

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getWarehouseType()).isEqualTo(WarehouseType.NORMAL);
    }

    @Test
    void create_shouldSaveWarehouse() {
        WareHouseRequest request = WareHouseRequest.builder()
                .code("W001")
                .name("Main Warehouse")
                .locationId(1L)
                .warehouseType(WarehouseType.NORMAL)
                .build();

        when(tenantRepository.findFirstByOrderByIdAsc()).thenReturn(Optional.of(tenant));
        when(locationRepository.findById(1L)).thenReturn(Optional.of(location));
        when(warehouseRepository.save(any(WareHouse.class))).thenAnswer(invocation -> invocation.getArgument(0));

        WareHouseResponse result = warehouseService.create(request);

        assertThat(result.getCode()).isEqualTo("W001");
        verify(warehouseRepository).save(any(WareHouse.class));
    }

    @Test
    void delete_shouldCallRepository() {
        when(tenantRepository.findFirstByOrderByIdAsc()).thenReturn(Optional.of(tenant));
        when(warehouseRepository.findByIdAndEnterpriseId(1L, 1L)).thenReturn(Optional.of(warehouse));

        warehouseService.delete(1L);

        verify(warehouseRepository).delete(warehouse);
    }
}
