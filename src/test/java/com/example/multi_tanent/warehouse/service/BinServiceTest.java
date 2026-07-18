package com.example.multi_tanent.warehouse.service;

import com.example.multi_tanent.spersusers.enitity.Tenant;
import com.example.multi_tanent.spersusers.repository.TenantRepository;
import com.example.multi_tanent.warehouse.dto.BinRequest;
import com.example.multi_tanent.warehouse.dto.BinResponse;
import com.example.multi_tanent.warehouse.entity.Bin;
import com.example.multi_tanent.warehouse.entity.Shelf;
import com.example.multi_tanent.warehouse.entity.WareHouse;
import com.example.multi_tanent.warehouse.enums.BinType;
import com.example.multi_tanent.warehouse.repository.BinRepository;
import com.example.multi_tanent.warehouse.repository.ShelfRepository;
import com.example.multi_tanent.warehouse.repository.WareHouseRepository;
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

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class BinServiceTest {

    @Mock
    private BinRepository binRepository;
    @Mock
    private ShelfRepository shelfRepository;
    @Mock
    private WareHouseRepository warehouseRepository;
    @Mock
    private TenantRepository tenantRepository;
    @Mock
    private WareBarcodeService barcodeService;
    @Mock
    private WareStorageService storageService;

    @InjectMocks
    private BinService binService;

    private Tenant mockTenant;
    private WareHouse mockWarehouse;
    private Shelf mockShelf;
    private Bin mockBin;

    @BeforeEach
    void setUp() {
        mockTenant = new Tenant();
        mockTenant.setId(1L);
        mockTenant.setTenantId("T001");

        mockWarehouse = WareHouse.builder().id(1L).name("Test WH").enterprise(mockTenant).build();
        mockShelf = Shelf.builder().id(1L).shelfCode("S1").build();
        mockBin = Bin.builder()
                .id(1L)
                .binCode("B001")
                .barcodeTag("TAG001")
                .warehouse(mockWarehouse)
                .shelf(mockShelf)
                .binType(BinType.STORAGE)
                .isActive(true)
                .build();
    }

    private void mockCurrentTenant() {
        when(tenantRepository.findFirstByOrderByIdAsc()).thenReturn(Optional.of(mockTenant));
    }

    @Test
    void listAll_ShouldReturnResponses() {
        mockCurrentTenant();
        when(binRepository.findByWarehouseEnterpriseId(1L)).thenReturn(List.of(mockBin));

        List<BinResponse> result = binService.listAll();

        assertFalse(result.isEmpty());
        assertEquals("B001", result.get(0).getBinCode());
        verify(binRepository).findByWarehouseEnterpriseId(1L);
    }

    @Test
    void getById_ShouldReturnResponse() {
        mockCurrentTenant();
        when(binRepository.findByIdAndWarehouseEnterpriseId(1L, 1L)).thenReturn(Optional.of(mockBin));

        BinResponse result = binService.getById(1L);

        assertNotNull(result);
        assertEquals("B001", result.getBinCode());
    }

    @Test
    void getById_ShouldThrowException_WhenNotFound() {
        mockCurrentTenant();
        when(binRepository.findByIdAndWarehouseEnterpriseId(1L, 1L)).thenReturn(Optional.empty());

        assertThrows(EntityNotFoundException.class, () -> binService.getById(1L));
    }

    @Test
    void fetchByBarcodeTag_ShouldReturnResponse() {
        mockCurrentTenant();
        when(binRepository.findByBarcodeTagAndWarehouseEnterpriseId("TAG001", 1L)).thenReturn(Optional.of(mockBin));

        BinResponse result = binService.fetchByBarcodeTag("TAG001");

        assertNotNull(result);
        assertEquals("B001", result.getBinCode());
        assertEquals("TAG001", result.getBarcodeTag());
    }

    @Test
    void create_ShouldGenerateBarcode_WhenEmpty() throws IOException {
        mockCurrentTenant();
        BinRequest request = BinRequest.builder()
                .warehouseId(1L)
                .shelfId(1L)
                .binCode("B002")
                .binType(BinType.STORAGE)
                .build();

        when(shelfRepository.findByIdAndRackZoneWarehouseEnterpriseId(eq(1L), eq(1L)))
                .thenReturn(Optional.of(mockShelf));
        when(warehouseRepository.findByIdAndEnterpriseId(eq(1L), eq(1L))).thenReturn(Optional.of(mockWarehouse));
        when(binRepository.existsByBinCodeAndWarehouseIdAndWarehouseEnterpriseId("B002", 1L, 1L)).thenReturn(false);
        when(barcodeService.generateBarcodeImage(anyString())).thenReturn(new byte[] { 1, 2, 3 });
        when(storageService.storeBinFile(any(), anyString(), eq("T001"))).thenReturn("path/to/img.png");
        when(binRepository.save(any(Bin.class))).thenAnswer(i -> {
            Bin b = i.getArgument(0);
            b.setId(2L);
            return b;
        });

        BinResponse result = binService.create(request);

        assertNotNull(result);
        assertNotNull(result.getBarcodeTag());
        assertTrue(result.getBarcodeTag().startsWith("B002-"));
        assertEquals("path/to/img.png", result.getBarcodeImageUrl());
        verify(binRepository).save(any(Bin.class));
    }

    @Test
    void update_ShouldUpdateFields() {
        mockCurrentTenant();
        BinRequest request = BinRequest.builder()
                .warehouseId(1L)
                .shelfId(1L)
                .binCode("B001-UPD")
                .isActive(false)
                .build();

        when(binRepository.findByIdAndWarehouseEnterpriseId(1L, 1L)).thenReturn(Optional.of(mockBin));
        when(shelfRepository.findByIdAndRackZoneWarehouseEnterpriseId(eq(1L), eq(1L)))
                .thenReturn(Optional.of(mockShelf));
        when(warehouseRepository.findByIdAndEnterpriseId(eq(1L), eq(1L))).thenReturn(Optional.of(mockWarehouse));
        when(binRepository.save(any(Bin.class))).thenReturn(mockBin);

        BinResponse result = binService.update(1L, request);

        assertNotNull(result);
        verify(binRepository).save(mockBin);
        assertEquals("B001-UPD", mockBin.getBinCode());
        assertFalse(mockBin.getIsActive());
    }

    @Test
    void delete_ShouldCallRepository() {
        mockCurrentTenant();
        when(binRepository.findByIdAndWarehouseEnterpriseId(1L, 1L)).thenReturn(Optional.of(mockBin));

        binService.delete(1L);

        verify(binRepository).delete(mockBin);
    }
}
