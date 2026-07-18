package com.example.multi_tanent.warehouse.service;

import com.example.multi_tanent.spersusers.enitity.Tenant;
import com.example.multi_tanent.spersusers.repository.TenantRepository;
import com.example.multi_tanent.warehouse.dto.ZoneRequest;
import com.example.multi_tanent.warehouse.dto.ZoneResponse;
import com.example.multi_tanent.warehouse.entity.Zone;
import com.example.multi_tanent.warehouse.entity.WareHouse;
import com.example.multi_tanent.warehouse.enums.ZoneType;
import com.example.multi_tanent.warehouse.repository.ZoneRepository;
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
class ZoneServiceTest {

    @Mock
    private ZoneRepository zoneRepository;
    @Mock
    private WareHouseRepository warehouseRepository;
    @Mock
    private TenantRepository tenantRepository;

    @InjectMocks
    private ZoneService zoneService;

    private Tenant tenant;
    private WareHouse warehouse;
    private Zone zone;

    @BeforeEach
    void setUp() {
        tenant = Tenant.builder().id(1L).tenantId("T1").build();
        warehouse = WareHouse.builder().id(1L).name("W1").build();
        zone = Zone.builder()
                .id(1L)
                .warehouse(warehouse)
                .name("Z1")
                .zoneType(ZoneType.STORAGE)
                .isActive(true)
                .build();
    }

    @Test
    void getAllZones_shouldReturnList() {
        when(tenantRepository.findFirstByOrderByIdAsc()).thenReturn(Optional.of(tenant));
        when(zoneRepository.findByWarehouseEnterpriseId(1L)).thenReturn(List.of(zone));

        List<ZoneResponse> result = zoneService.getAllZones();

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getName()).isEqualTo("Z1");
    }

    @Test
    void getById_shouldReturnResponse() {
        when(tenantRepository.findFirstByOrderByIdAsc()).thenReturn(Optional.of(tenant));
        when(zoneRepository.findByIdAndWarehouseEnterpriseId(1L, 1L)).thenReturn(Optional.of(zone));

        ZoneResponse result = zoneService.getById(1L);

        assertThat(result.getName()).isEqualTo("Z1");
    }

    @Test
    void fetchByZoneType_shouldReturnList() {
        when(tenantRepository.findFirstByOrderByIdAsc()).thenReturn(Optional.of(tenant));
        when(zoneRepository.findByZoneTypeAndWarehouseEnterpriseId(ZoneType.STORAGE, 1L)).thenReturn(List.of(zone));

        List<ZoneResponse> result = zoneService.fetchByZoneType(ZoneType.STORAGE);

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getZoneType()).isEqualTo(ZoneType.STORAGE);
    }

    @Test
    void create_shouldSaveZone() {
        ZoneRequest request = ZoneRequest.builder()
                .warehouseId(1L)
                .name("Z1")
                .zoneType(ZoneType.STORAGE)
                .build();

        when(tenantRepository.findFirstByOrderByIdAsc()).thenReturn(Optional.of(tenant));
        when(warehouseRepository.findByIdAndEnterpriseId(1L, 1L)).thenReturn(Optional.of(warehouse));
        when(zoneRepository.save(any(Zone.class))).thenAnswer(invocation -> invocation.getArgument(0));

        ZoneResponse result = zoneService.create(request);

        assertThat(result.getName()).isEqualTo("Z1");
        verify(zoneRepository).save(any(Zone.class));
    }

    @Test
    void delete_shouldCallRepository() {
        when(tenantRepository.findFirstByOrderByIdAsc()).thenReturn(Optional.of(tenant));
        when(zoneRepository.findByIdAndWarehouseEnterpriseId(1L, 1L)).thenReturn(Optional.of(zone));

        zoneService.delete(1L);

        verify(zoneRepository).delete(zone);
    }
}
