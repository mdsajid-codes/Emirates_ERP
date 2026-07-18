package com.example.multi_tanent.hanger.service;

import com.example.multi_tanent.config.TenantContext;
import com.example.multi_tanent.hanger.dto.HangerTypeRequest;
import com.example.multi_tanent.hanger.dto.HangerTypeResponse;
import com.example.multi_tanent.hanger.entity.HangerType;
import com.example.multi_tanent.hanger.enums.HangerTypeEnum;
import com.example.multi_tanent.hanger.repository.HangerTypeRepository;
import com.example.multi_tanent.spersusers.enitity.Tenant;
import com.example.multi_tanent.spersusers.repository.TenantRepository;
import jakarta.persistence.EntityNotFoundException;
import org.junit.jupiter.api.AfterEach;
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
class HangerTypeServiceTest {

    @Mock
    private HangerTypeRepository hangerTypeRepository;

    @Mock
    private TenantRepository tenantRepository;

    @InjectMocks
    private HangerTypeService hangerTypeService;

    private static final String TENANT_ID = "test-tenant";

    @BeforeEach
    void setUp() {
        TenantContext.setTenantId(TENANT_ID);
    }

    @AfterEach
    void tearDown() {
        TenantContext.clear();
    }

    @Test
    void getAllActive_ShouldReturnList() {
        HangerType hangerType = new HangerType();
        hangerType.setTypeName(HangerTypeEnum.ADULT);
        hangerType.setUnitWeightGrams(new BigDecimal("50.0"));

        when(hangerTypeRepository.findByTenantTenantIdAndIsActiveTrue(TENANT_ID))
                .thenReturn(List.of(hangerType));

        List<HangerTypeResponse> result = hangerTypeService.getAllActive();

        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals(HangerTypeEnum.ADULT, result.get(0).getTypeName());
    }

    @Test
    void create_ShouldSaveAndReturnResponse() {
        HangerTypeRequest request = new HangerTypeRequest();
        request.setTypeName(HangerTypeEnum.ADULT);
        request.setUnitWeightGrams(new BigDecimal("50.0"));
        request.setStandardWidthCm(new BigDecimal("42.0"));
        request.setStandardHookCm(new BigDecimal("4.5"));

        Tenant tenant = new Tenant();
        tenant.setTenantId(TENANT_ID);

        when(hangerTypeRepository.existsByTenantTenantIdAndTypeName(TENANT_ID, HangerTypeEnum.ADULT))
                .thenReturn(false);
        when(tenantRepository.findByTenantId(TENANT_ID)).thenReturn(Optional.of(tenant));
        when(hangerTypeRepository.save(any(HangerType.class))).thenAnswer(invocation -> invocation.getArgument(0));

        HangerTypeResponse result = hangerTypeService.create(request);

        assertNotNull(result);
        assertEquals(HangerTypeEnum.ADULT, result.getTypeName());
        verify(hangerTypeRepository, times(1)).save(any(HangerType.class));
    }

    @Test
    void create_ShouldThrowException_WhenAlreadyExists() {
        HangerTypeRequest request = new HangerTypeRequest();
        request.setTypeName(HangerTypeEnum.ADULT);

        when(hangerTypeRepository.existsByTenantTenantIdAndTypeName(TENANT_ID, HangerTypeEnum.ADULT))
                .thenReturn(true);

        assertThrows(IllegalArgumentException.class, () -> hangerTypeService.create(request));
    }

    @Test
    void findById_ShouldThrowException_WhenNotFound() {
        when(hangerTypeRepository.findById(1L)).thenReturn(Optional.empty());

        assertThrows(EntityNotFoundException.class, () -> hangerTypeService.getById(1L));
    }
}
