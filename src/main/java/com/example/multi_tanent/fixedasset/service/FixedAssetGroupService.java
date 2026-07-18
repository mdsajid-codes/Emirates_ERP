package com.example.multi_tanent.fixedasset.service;

import com.example.multi_tanent.accounts.exception.ResourceNotFoundException;
import com.example.multi_tanent.config.TenantContext;
import com.example.multi_tanent.fixedasset.entity.FixedAssetGroup;
import com.example.multi_tanent.fixedasset.repository.FixedAssetGroupRepository;
import com.example.multi_tanent.spersusers.enitity.Tenant;
import com.example.multi_tanent.spersusers.repository.TenantRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional("tenantTx")
public class FixedAssetGroupService {

    private final FixedAssetGroupRepository groupRepository;
    private final TenantRepository tenantRepository;

    private Tenant getCurrentTenant() {
        String tid = TenantContext.getTenantId();
        return tenantRepository.findByTenantId(tid)
                .or(() -> tenantRepository.findFirstByOrderByIdAsc())
                .orElseThrow(() -> new ResourceNotFoundException("No tenant record found in database."));
    }

    public List<FixedAssetGroup> getAllGroups() {
        Long tenantId = getCurrentTenant().getId();
        return groupRepository.findByTenant_Id(tenantId);
    }
}
