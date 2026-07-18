package com.example.multi_tanent.warehouse.service;

import com.example.multi_tanent.spersusers.enitity.Tenant;
import com.example.multi_tanent.spersusers.repository.TenantRepository;
import com.example.multi_tanent.warehouse.dto.RackRequest;
import com.example.multi_tanent.warehouse.dto.RackResponse;
import com.example.multi_tanent.warehouse.entity.Rack;
import com.example.multi_tanent.warehouse.entity.Zone;
import com.example.multi_tanent.warehouse.enums.RackType;
import com.example.multi_tanent.warehouse.repository.RackRepository;
import com.example.multi_tanent.warehouse.repository.ZoneRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.io.IOException;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class RackServiceTest {

    @Mock
    private RackRepository rackRepository;
    @Mock
    private ZoneRepository zoneRepository;
    @Mock
    private TenantRepository tenantRepository;
    @Mock
    private WareBarcodeService barcodeService;
    @Mock
    private WareStorageService storageService;

    @InjectMocks
    private RackService rackService;

    private Tenant tenant;
    private Zone zone;
    private Rack rack;

    @BeforeEach
    void setUp() {
        tenant = Tenant.builder().id(1L).tenantId("T1").build();
        zone = Zone.builder().id(1L).name("Z1").build();
        rack = Rack.builder()
                .id(1L)
                .zone(zone)
                .rackCode("R1")
                .rackType(RackType.STORAGE)
                .isActive(true)
                .barcodeTag("B1")
                .build();
    }

    @Test
    void getAllRacks_shouldReturnList() {
        when(tenantRepository.findFirstByOrderByIdAsc()).thenReturn(Optional.of(tenant));
        when(rackRepository.findByZoneWarehouseEnterpriseId(1L)).thenReturn(List.of(rack));

        List<RackResponse> result = rackService.getAllRacks();

        assertThat(result).hasSize(1);
    }

    @Test
    void getById_shouldReturnResponse() {
        when(tenantRepository.findFirstByOrderByIdAsc()).thenReturn(Optional.of(tenant));
        when(rackRepository.findByIdAndZoneWarehouseEnterpriseId(1L, 1L)).thenReturn(Optional.of(rack));

        RackResponse result = rackService.getById(1L);

        assertThat(result.getRackCode()).isEqualTo("R1");
    }

    @Test
    void fetchByRackType_shouldReturnList() {
        when(tenantRepository.findFirstByOrderByIdAsc()).thenReturn(Optional.of(tenant));
        when(rackRepository.findByRackTypeAndZoneWarehouseEnterpriseId(RackType.STORAGE, 1L)).thenReturn(List.of(rack));

        List<RackResponse> result = rackService.fetchByRackType(RackType.STORAGE);

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getRackType()).isEqualTo(RackType.STORAGE);
    }

    @Test
    void create_shouldAutoGenerateBarcodeIfEmpty() throws IOException {
        RackRequest request = RackRequest.builder()
                .zoneId(1L)
                .rackCode("R1")
                .rackType(RackType.STORAGE)
                .build();

        when(tenantRepository.findFirstByOrderByIdAsc()).thenReturn(Optional.of(tenant));
        when(zoneRepository.findByIdAndWarehouseEnterpriseId(1L, 1L)).thenReturn(Optional.of(zone));
        when(barcodeService.generateBarcodeImage(anyString())).thenReturn(new byte[] { 1, 2, 3 });
        when(storageService.storeRackFile(any(), anyString(), anyString())).thenReturn("path/to/image.png");
        when(rackRepository.save(any(Rack.class))).thenAnswer(invocation -> invocation.getArgument(0));

        RackResponse result = rackService.create(request);

        assertThat(result.getBarcodeTag()).startsWith("RCK-R1-");
        assertThat(result.getBarcodeImageUrl()).isEqualTo("path/to/image.png");
    }

    @Test
    void update_shouldUpdateBarcodeImageIfBarcodeChanged() throws IOException {
        RackRequest request = RackRequest.builder()
                .zoneId(1L)
                .rackCode("R1")
                .barcodeTag("NEW_B1")
                .isActive(true)
                .build();

        when(tenantRepository.findFirstByOrderByIdAsc()).thenReturn(Optional.of(tenant));
        when(rackRepository.findByIdAndZoneWarehouseEnterpriseId(1L, 1L)).thenReturn(Optional.of(rack));
        when(zoneRepository.findByIdAndWarehouseEnterpriseId(1L, 1L)).thenReturn(Optional.of(zone));
        when(barcodeService.generateBarcodeImage("NEW_B1")).thenReturn(new byte[] { 1, 2, 3 });
        when(storageService.storeRackFile(any(), anyString(), anyString())).thenReturn("new/path.png");
        when(rackRepository.save(any(Rack.class))).thenAnswer(invocation -> invocation.getArgument(0));

        RackResponse result = rackService.update(1L, request);

        assertThat(result.getBarcodeTag()).isEqualTo("NEW_B1");
        assertThat(result.getBarcodeImageUrl()).isEqualTo("new/path.png");
    }

    @Test
    void delete_shouldCallRepository() {
        when(tenantRepository.findFirstByOrderByIdAsc()).thenReturn(Optional.of(tenant));
        when(rackRepository.findByIdAndZoneWarehouseEnterpriseId(1L, 1L)).thenReturn(Optional.of(rack));

        rackService.delete(1L);

        verify(rackRepository).delete(rack);
    }
}
