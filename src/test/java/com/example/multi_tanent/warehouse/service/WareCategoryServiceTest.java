package com.example.multi_tanent.warehouse.service;

import com.example.multi_tanent.spersusers.enitity.Tenant;
import com.example.multi_tanent.spersusers.repository.TenantRepository;
import com.example.multi_tanent.warehouse.dto.WareCategoryRequest;
import com.example.multi_tanent.warehouse.dto.WareCategoryResponse;
import com.example.multi_tanent.warehouse.entity.WareCategory;
import com.example.multi_tanent.warehouse.repository.WareCategoryRepository;
import jakarta.persistence.EntityNotFoundException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class WareCategoryServiceTest {

    @Mock
    private WareCategoryRepository categoryRepository;

    @Mock
    private TenantRepository tenantRepository;

    @InjectMocks
    private WareCategoryService categoryService;

    private Tenant mockTenant;
    private WareCategory mockCategory;

    @BeforeEach
    void setUp() {
        mockTenant = Tenant.builder().id(1L).name("Mock Tenant").build();
        mockCategory = WareCategory.builder()
                .id(1L)
                .name("Electronics")
                .description("Electronic items")
                .enterprise(mockTenant)
                .subCategories(Collections.emptyList())
                .build();
    }

    @Test
    void getById_ShouldReturnCategoryResponse() {
        when(categoryRepository.findById(1L)).thenReturn(Optional.of(mockCategory));

        WareCategoryResponse result = categoryService.getById(1L);

        assertNotNull(result);
        assertEquals("Electronics", result.getName());
        verify(categoryRepository).findById(1L);
    }

    @Test
    void getById_ShouldThrowException_WhenNotFound() {
        when(categoryRepository.findById(1L)).thenReturn(Optional.empty());

        assertThrows(EntityNotFoundException.class, () -> categoryService.getById(1L));
    }

    @Test
    void list_ShouldReturnCategoryResponses() {
        when(tenantRepository.findFirstByOrderByIdAsc()).thenReturn(Optional.of(mockTenant));
        when(categoryRepository.findByEnterpriseId(1L)).thenReturn(List.of(mockCategory));

        List<WareCategoryResponse> result = categoryService.list();

        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals("Electronics", result.get(0).getName());
        verify(categoryRepository).findByEnterpriseId(1L);
    }

    @Test
    void create_ShouldReturnCategoryResponse() {
        WareCategoryRequest request = WareCategoryRequest.builder()
                .name("Appliances")
                .description("Home appliances")
                .build();
        when(tenantRepository.findFirstByOrderByIdAsc()).thenReturn(Optional.of(mockTenant));
        when(categoryRepository.save(any(WareCategory.class))).thenAnswer(invocation -> {
            WareCategory saved = invocation.getArgument(0);
            saved.setId(2L);
            saved.setSubCategories(Collections.emptyList());
            return saved;
        });

        WareCategoryResponse result = categoryService.create(request);

        assertNotNull(result);
        assertEquals("Appliances", result.getName());
        assertEquals(2L, result.getId());
        verify(categoryRepository).save(any(WareCategory.class));
    }

    @Test
    void update_ShouldReturnUpdatedCategoryResponse() {
        WareCategoryRequest request = WareCategoryRequest.builder()
                .name("Modern Electronics")
                .description("Laptops and Phones")
                .build();
        when(categoryRepository.findById(1L)).thenReturn(Optional.of(mockCategory));
        when(categoryRepository.save(any(WareCategory.class))).thenReturn(mockCategory);

        WareCategoryResponse result = categoryService.update(1L, request);

        assertNotNull(result);
        assertEquals("Modern Electronics", result.getName());
        verify(categoryRepository).save(any(WareCategory.class));
    }

    @Test
    void delete_ShouldCallRepositoryDelete() {
        categoryService.delete(1L);
        verify(categoryRepository).deleteById(1L);
    }
}
