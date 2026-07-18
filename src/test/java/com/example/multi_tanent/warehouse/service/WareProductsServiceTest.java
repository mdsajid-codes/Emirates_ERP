package com.example.multi_tanent.warehouse.service;

import com.example.multi_tanent.spersusers.enitity.Tenant;
import com.example.multi_tanent.spersusers.repository.LocationRepository;
import com.example.multi_tanent.spersusers.repository.TenantRepository;
import com.example.multi_tanent.warehouse.dto.WareProductRequest;
import com.example.multi_tanent.warehouse.dto.WareProductResponse;
import com.example.multi_tanent.warehouse.entity.WareProducts;
import com.example.multi_tanent.warehouse.repository.*;
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
class WareProductsServiceTest {

    @Mock
    private WareProductsRepository productRepository;
    @Mock
    private WareCategoryRepository categoryRepository;
    @Mock
    private WareSubCategoryRepository subCategoryRepository;
    @Mock
    private UoMRepository uomRepository;
    @Mock
    private WareTaxRepository taxRepository;
    @Mock
    private TenantRepository tenantRepository;
    @Mock
    private LocationRepository locationRepository;
    @Mock
    private WareBarcodeService barcodeService;
    @Mock
    private WareStorageService storageService;

    @InjectMocks
    private WareProductsService productService;

    private Tenant mockTenant;
    private WareProducts mockProduct;

    @BeforeEach
    void setUp() {
        mockTenant = Tenant.builder().id(1L).name("Mock Tenant").build();
        mockProduct = WareProducts.builder()
                .id(1L)
                .sku("SKU001")
                .name("Product 1")
                .enterprise(mockTenant)
                .build();
    }

    @Test
    void getByBarcode_ShouldReturnProductResponse() {
        when(tenantRepository.findFirstByOrderByIdAsc()).thenReturn(Optional.of(mockTenant));
        when(productRepository.findByBarcodeAndEnterpriseId("BC001", 1L)).thenReturn(Optional.of(mockProduct));

        WareProductResponse result = productService.getByBarcode("BC001");

        assertNotNull(result);
        assertEquals("SKU001", result.getSku());
    }

    @Test
    void getById_ShouldReturnProductResponse() {
        when(tenantRepository.findFirstByOrderByIdAsc()).thenReturn(Optional.of(mockTenant));
        when(productRepository.findByIdAndEnterpriseId(1L, 1L)).thenReturn(Optional.of(mockProduct));

        WareProductResponse result = productService.getById(1L);

        assertNotNull(result);
        assertEquals("SKU001", result.getSku());
    }

    @Test
    void create_ShouldReturnProductResponse() {
        WareProductRequest request = WareProductRequest.builder()
                .sku("SKU001")
                .name("Product 1")
                .purchasePrice(new BigDecimal("100"))
                .build();

        when(tenantRepository.findFirstByOrderByIdAsc()).thenReturn(Optional.of(mockTenant));
        when(productRepository.existsBySkuAndEnterpriseId("SKU001", 1L)).thenReturn(false);
        when(productRepository.save(any(WareProducts.class))).thenAnswer(invocation -> {
            WareProducts saved = invocation.getArgument(0);
            saved.setId(1L);
            return saved;
        });

        WareProductResponse result = productService.create(request);

        assertNotNull(result);
        assertEquals("SKU001", result.getSku());
        verify(productRepository).save(any(WareProducts.class));
    }

    @Test
    void create_ShouldThrowException_WhenSkuExists() {
        WareProductRequest request = WareProductRequest.builder().sku("SKU001").build();
        when(tenantRepository.findFirstByOrderByIdAsc()).thenReturn(Optional.of(mockTenant));
        when(productRepository.existsBySkuAndEnterpriseId("SKU001", 1L)).thenReturn(true);

        assertThrows(IllegalArgumentException.class, () -> productService.create(request));
    }

    @Test
    void delete_ShouldCallRepositoryDelete() {
        when(tenantRepository.findFirstByOrderByIdAsc()).thenReturn(Optional.of(mockTenant));
        when(productRepository.findByIdAndEnterpriseId(1L, 1L)).thenReturn(Optional.of(mockProduct));

        productService.delete(1L);

        verify(productRepository).delete(mockProduct);
    }
}
