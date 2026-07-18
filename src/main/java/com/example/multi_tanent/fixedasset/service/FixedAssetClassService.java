package com.example.multi_tanent.fixedasset.service;

import com.example.multi_tanent.accounts.exception.ResourceNotFoundException;
import com.example.multi_tanent.config.TenantContext;
import com.example.multi_tanent.fixedasset.entity.FixedAssetClass;
import com.example.multi_tanent.fixedasset.repository.FixedAssetClassRepository;
import com.example.multi_tanent.spersusers.enitity.Tenant;
import com.example.multi_tanent.spersusers.repository.TenantRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional("tenantTx")
public class FixedAssetClassService {

    private final FixedAssetClassRepository classRepository;
    private final TenantRepository tenantRepository;

    private Tenant getCurrentTenant() {
        String tid = TenantContext.getTenantId();
        return tenantRepository.findByTenantId(tid)
                .or(() -> tenantRepository.findFirstByOrderByIdAsc())
                .orElseThrow(() -> new ResourceNotFoundException("No tenant record found in database."));
    }

    public List<FixedAssetClass> getAllClasses() {
        Long tenantId = getCurrentTenant().getId();
        return classRepository.findByTenant_Id(tenantId);
    }
}
