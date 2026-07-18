package com.example.multi_tanent.warehouse.service;

import com.example.multi_tanent.spersusers.enitity.Tenant;
import com.example.multi_tanent.spersusers.repository.TenantRepository;
import com.example.multi_tanent.warehouse.dto.UoMRequest;
import com.example.multi_tanent.warehouse.dto.UoMResponse;
import com.example.multi_tanent.warehouse.entity.UoM;
import com.example.multi_tanent.warehouse.repository.UoMRepository;
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
class UoMServiceTest {

    @Mock
    private UoMRepository uomRepository;

    @Mock
    private TenantRepository tenantRepository;

    @InjectMocks
    private UoMService uomService;

    private Tenant mockTenant;
    private UoM mockUoM;

    @BeforeEach
    void setUp() {
        mockTenant = Tenant.builder().id(1L).name("Mock Tenant").build();
        mockUoM = UoM.builder().id(1L).name("Kilogram").shortName("kg").enterprise(mockTenant).build();
    }

    @Test
    void list_ShouldReturnUoMResponses() {
        when(tenantRepository.findFirstByOrderByIdAsc()).thenReturn(Optional.of(mockTenant));
        when(uomRepository.findByEnterpriseId(1L)).thenReturn(List.of(mockUoM));

        List<UoMResponse> result = uomService.list();

        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals("Kilogram", result.get(0).getName());
        verify(uomRepository).findByEnterpriseId(1L);
    }

    @Test
    void create_ShouldReturnUoMResponse() {
        UoMRequest request = UoMRequest.builder().name("Liter").shortName("L").build();
        when(tenantRepository.findFirstByOrderByIdAsc()).thenReturn(Optional.of(mockTenant));
        when(uomRepository.save(any(UoM.class))).thenAnswer(invocation -> {
            UoM saved = invocation.getArgument(0);
            saved.setId(2L);
            return saved;
        });

        UoMResponse result = uomService.create(request);

        assertNotNull(result);
        assertEquals("Liter", result.getName());
        assertEquals(2L, result.getId());
        verify(uomRepository).save(any(UoM.class));
    }

    @Test
    void update_ShouldReturnUpdatedUoMResponse() {
        UoMRequest request = UoMRequest.builder().name("Grams").shortName("g").build();
        when(uomRepository.findById(1L)).thenReturn(Optional.of(mockUoM));
        when(uomRepository.save(any(UoM.class))).thenReturn(mockUoM);

        UoMResponse result = uomService.update(1L, request);

        assertNotNull(result);
        assertEquals("Grams", result.getName());
        verify(uomRepository).save(any(UoM.class));
    }

    @Test
    void update_ShouldThrowException_WhenNotFound() {
        UoMRequest request = UoMRequest.builder().name("Grams").shortName("g").build();
        when(uomRepository.findById(1L)).thenReturn(Optional.empty());

        assertThrows(EntityNotFoundException.class, () -> uomService.update(1L, request));
    }

    @Test
    void delete_ShouldCallRepositoryDelete() {
        uomService.delete(1L);
        verify(uomRepository).deleteById(1L);
    }
}
