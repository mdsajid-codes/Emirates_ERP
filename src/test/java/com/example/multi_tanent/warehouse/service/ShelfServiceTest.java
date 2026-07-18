package com.example.multi_tanent.warehouse.service;

import com.example.multi_tanent.spersusers.enitity.Tenant;
import com.example.multi_tanent.spersusers.repository.TenantRepository;
import com.example.multi_tanent.warehouse.dto.ShelfRequest;
import com.example.multi_tanent.warehouse.dto.ShelfResponse;
import com.example.multi_tanent.warehouse.entity.Rack;
import com.example.multi_tanent.warehouse.entity.Shelf;
import com.example.multi_tanent.warehouse.repository.RackRepository;
import com.example.multi_tanent.warehouse.repository.ShelfRepository;
import jakarta.persistence.EntityNotFoundException;
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
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ShelfServiceTest {

    @Mock
    private ShelfRepository shelfRepository;
    @Mock
    private RackRepository rackRepository;
    @Mock
    private TenantRepository tenantRepository;
    @Mock
    private WareBarcodeService barcodeService;
    @Mock
    private WareStorageService storageService;

    @InjectMocks
    private ShelfService shelfService;

    private Tenant tenant;
    private Rack rack;
    private Shelf shelf;

    @BeforeEach
    void setUp() {
        tenant = Tenant.builder().id(1L).tenantId("T1").build();
        rack = Rack.builder().id(1L).rackCode("R1").build();
        shelf = Shelf.builder()
                .id(1L)
                .rack(rack)
                .shelfCode("S1")
                .isActive(true)
                .barcodeTag("B1")
                .build();
    }

    @Test
    void getAllShelves_shouldReturnList() {
        when(tenantRepository.findFirstByOrderByIdAsc()).thenReturn(Optional.of(tenant));
        when(shelfRepository.findByRackZoneWarehouseEnterpriseId(1L)).thenReturn(List.of(shelf));

        List<ShelfResponse> result = shelfService.getAllShelves();

        assertThat(result).hasSize(1);
    }

    @Test
    void fetchByActive_shouldReturnList() {
        when(tenantRepository.findFirstByOrderByIdAsc()).thenReturn(Optional.of(tenant));
        when(shelfRepository.findByIsActiveAndRackZoneWarehouseEnterpriseId(true, 1L)).thenReturn(List.of(shelf));

        List<ShelfResponse> result = shelfService.fetchByActive(true);

        assertThat(result).hasSize(1);
    }

    @Test
    void fetchByBarcodeTag_shouldReturnResponse() {
        when(tenantRepository.findFirstByOrderByIdAsc()).thenReturn(Optional.of(tenant));
        when(shelfRepository.findByBarcodeTagAndRackZoneWarehouseEnterpriseId("B1", 1L)).thenReturn(Optional.of(shelf));

        ShelfResponse result = shelfService.fetchByBarcodeTag("B1");

        assertThat(result.getBarcodeTag()).isEqualTo("B1");
    }

    @Test
    void createShelf_shouldAutoGenerateBarcodeIfEmpty() throws IOException {
        ShelfRequest request = ShelfRequest.builder()
                .rackId(1L)
                .shelfCode("S1")
                .build();

        when(tenantRepository.findFirstByOrderByIdAsc()).thenReturn(Optional.of(tenant));
        when(rackRepository.findByIdAndZoneWarehouseEnterpriseId(1L, 1L)).thenReturn(Optional.of(rack));
        when(barcodeService.generateBarcodeImage(anyString())).thenReturn(new byte[] { 1, 2, 3 });
        when(storageService.storeShelfFile(any(), anyString(), anyString())).thenReturn("path/to/image.png");
        when(shelfRepository.save(any(Shelf.class))).thenAnswer(invocation -> invocation.getArgument(0));

        ShelfResponse result = shelfService.createShelf(request);

        assertThat(result.getBarcodeTag()).startsWith("SHF-S1-");
        assertThat(result.getBarcodeImageUrl()).isEqualTo("path/to/image.png");
        verify(barcodeService).generateBarcodeImage(anyString());
        verify(storageService).storeShelfFile(any(), eq("S1"), eq("T1"));
    }

    @Test
    void updateShelf_shouldUpdateBarcodeImageIfBarcodeChanged() throws IOException {
        ShelfRequest request = ShelfRequest.builder()
                .rackId(1L)
                .shelfCode("S1")
                .barcodeTag("NEW_B1")
                .isActive(true)
                .build();

        when(tenantRepository.findFirstByOrderByIdAsc()).thenReturn(Optional.of(tenant));
        when(shelfRepository.findByIdAndRackZoneWarehouseEnterpriseId(1L, 1L)).thenReturn(Optional.of(shelf));
        when(rackRepository.findByIdAndZoneWarehouseEnterpriseId(1L, 1L)).thenReturn(Optional.of(rack));
        when(barcodeService.generateBarcodeImage("NEW_B1")).thenReturn(new byte[] { 1, 2, 3 });
        when(storageService.storeShelfFile(any(), anyString(), anyString())).thenReturn("new/path.png");
        when(shelfRepository.save(any(Shelf.class))).thenAnswer(invocation -> invocation.getArgument(0));

        ShelfResponse result = shelfService.updateShelf(1L, request);

        assertThat(result.getBarcodeTag()).isEqualTo("NEW_B1");
        assertThat(result.getBarcodeImageUrl()).isEqualTo("new/path.png");
    }
}
