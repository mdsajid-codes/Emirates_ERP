package com.example.multi_tanent.warehouse.service;

import com.example.multi_tanent.spersusers.enitity.Tenant;
import com.example.multi_tanent.spersusers.repository.TenantRepository;
import com.example.multi_tanent.warehouse.dto.WareSubCategoryRequest;
import com.example.multi_tanent.warehouse.dto.WareSubCategoryResponse;
import com.example.multi_tanent.warehouse.entity.WareCategory;
import com.example.multi_tanent.warehouse.entity.WareSubCategory;
import com.example.multi_tanent.warehouse.repository.WareCategoryRepository;
import com.example.multi_tanent.warehouse.repository.WareSubCategoryRepository;
import jakarta.persistence.EntityNotFoundException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class WareSubCategoryServiceTest {

    @Mock
    private WareSubCategoryRepository subCategoryRepository;
    @Mock
    private WareCategoryRepository categoryRepository;
    @Mock
    private TenantRepository tenantRepository;

    @InjectMocks
    private WareSubCategoryService subCategoryService;

    private Tenant mockTenant;
    private WareCategory mockCategory;
    private WareSubCategory mockSubCategory;

    @BeforeEach
    void setUp() {
        mockTenant = Tenant.builder().id(1L).name("Mock Tenant").build();
        mockCategory = WareCategory.builder().id(10L).name("Main Cat").build();
        mockSubCategory = WareSubCategory.builder()
                .id(1L)
                .name("Sub Cat")
                .category(mockCategory)
                .enterprise(mockTenant)
                .build();
    }

    @Test
    void list_ShouldReturnResponses() {
        when(tenantRepository.findFirstByOrderByIdAsc()).thenReturn(Optional.of(mockTenant));
        when(subCategoryRepository.findByEnterpriseId(1L)).thenReturn(List.of(mockSubCategory));

        List<WareSubCategoryResponse> result = subCategoryService.list(null);

        assertEquals(1, result.size());
        assertEquals("Sub Cat", result.get(0).getName());
    }

    @Test
    void create_ShouldReturnResponse() {
        WareSubCategoryRequest request = WareSubCategoryRequest.builder()
                .name("New Sub")
                .categoryId(10L)
                .build();

        when(tenantRepository.findFirstByOrderByIdAsc()).thenReturn(Optional.of(mockTenant));
        when(categoryRepository.findById(10L)).thenReturn(Optional.of(mockCategory));
        when(subCategoryRepository.save(any(WareSubCategory.class))).thenReturn(mockSubCategory);

        WareSubCategoryResponse result = subCategoryService.create(request);

        assertNotNull(result);
        verify(subCategoryRepository).save(any(WareSubCategory.class));
    }

    @Test
    void create_ShouldThrow_WhenCategoryNotFound() {
        WareSubCategoryRequest request = WareSubCategoryRequest.builder().categoryId(99L).build();
        when(tenantRepository.findFirstByOrderByIdAsc()).thenReturn(Optional.of(mockTenant));
        when(categoryRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(EntityNotFoundException.class, () -> subCategoryService.create(request));
    }

    @Test
    void delete_ShouldCallRepository() {
        subCategoryService.delete(1L);
        verify(subCategoryRepository).deleteById(1L);
    }
}
