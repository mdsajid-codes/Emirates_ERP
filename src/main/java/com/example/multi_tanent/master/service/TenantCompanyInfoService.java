package com.example.multi_tanent.master.service;

import com.example.multi_tanent.master.dto.TenantCompanyInfoRequest;
import com.example.multi_tanent.master.dto.TenantCompanyInfoResponse;
import org.springframework.core.io.Resource;

import java.io.IOException;

public interface TenantCompanyInfoService {
    TenantCompanyInfoResponse saveOrUpdate(Long masterTenantId, TenantCompanyInfoRequest request) throws IOException;

    TenantCompanyInfoResponse getByMasterTenantId(Long masterTenantId);

    void deleteByMasterTenantId(Long masterTenantId);

    Resource loadFileAsResource(String fileName) throws IOException;
}
