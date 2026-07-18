package com.example.multi_tanent.tenant.payroll.service;

import com.example.multi_tanent.config.TenantContext;
import com.example.multi_tanent.spersusers.enitity.CompanyInfo;
import com.example.multi_tanent.spersusers.enitity.Tenant;
import com.example.multi_tanent.spersusers.repository.TenantRepository;
import com.example.multi_tanent.tenant.payroll.repository.CompanyInfoRepository;
import com.example.multi_tanent.tenant.service.FileStorageService;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockMultipartFile;

import java.io.IOException;
import java.util.Collections;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class CompanyInfoServiceTest {

    @Mock
    private CompanyInfoRepository companyInfoRepository;

    @Mock
    private FileStorageService fileStorageService;

    @Mock
    private TenantRepository tenantRepository;

    @InjectMocks
    private CompanyInfoService companyInfoService;

    @BeforeEach
    void setUp() {
        TenantContext.setTenantId("tenant1");
    }

    @AfterEach
    void tearDown() {
        TenantContext.clear();
    }

    @Test
    void testUploadLogo_NewLogo() throws IOException {
        // Mock existing CompanyInfo
        CompanyInfo existingInfo = new CompanyInfo();
        existingInfo.setId(1L);
        existingInfo.setLocations(Collections.emptyList());
        existingInfo.setBankAccounts(Collections.emptyList());

        // Ensure getCompanyInfo returns this
        when(companyInfoRepository.findAll()).thenReturn(Collections.singletonList(existingInfo));
        // Mock TenantRepository for getCompanyInfo logic
        Tenant tenant = new Tenant();
        tenant.setTenantId("tenant1");
        when(tenantRepository.findByTenantId("tenant1")).thenReturn(Optional.of(tenant));

        when(companyInfoRepository.save(any(CompanyInfo.class))).thenAnswer(invocation -> invocation.getArgument(0));

        // Mock FileStorage
        String expectedPath = "logo/1234567890_logo.png";
        when(fileStorageService.storeFile(any(byte[].class), eq("logo"), anyString())).thenReturn(expectedPath);

        MockMultipartFile file = new MockMultipartFile("file", "test_logo.png", "image/png", "content".getBytes());

        CompanyInfo result = companyInfoService.uploadLogo(file);

        assertNotNull(result);
        assertEquals(expectedPath, result.getLogoUrl());

        // Verify storage call
        ArgumentCaptor<String> filenameCaptor = ArgumentCaptor.forClass(String.class);
        verify(fileStorageService).storeFile(any(byte[].class), eq("logo"), filenameCaptor.capture());

        String storedFilename = filenameCaptor.getValue();
        assertTrue(storedFilename.endsWith("_logo.png"));
        assertTrue(storedFilename.matches("\\d+_logo\\.png"));
    }

    @Test
    void testUploadLogo_ReplaceExisting() throws IOException {
        // Mock existing CompanyInfo with Logo
        CompanyInfo existingInfo = new CompanyInfo();
        existingInfo.setId(1L);
        existingInfo.setLogoUrl("logo/old_logo.png");
        existingInfo.setLocations(Collections.emptyList());
        existingInfo.setBankAccounts(Collections.emptyList());

        when(companyInfoRepository.findAll()).thenReturn(Collections.singletonList(existingInfo));
        // Mock TenantRepository for getCompanyInfo logic
        Tenant tenant = new Tenant();
        tenant.setTenantId("tenant1");
        when(tenantRepository.findByTenantId("tenant1")).thenReturn(Optional.of(tenant));

        when(companyInfoRepository.save(any(CompanyInfo.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(fileStorageService.storeFile(any(byte[].class), eq("logo"), anyString())).thenReturn("logo/new_logo.png");

        MockMultipartFile file = new MockMultipartFile("file", "new.png", "image/png", "new".getBytes());

        CompanyInfo result = companyInfoService.uploadLogo(file);

        assertEquals("logo/new_logo.png", result.getLogoUrl());

        // Verify deletion of old file with tenant prefix
        verify(fileStorageService).deleteFile("tenant1/logo/old_logo.png");
    }
}
