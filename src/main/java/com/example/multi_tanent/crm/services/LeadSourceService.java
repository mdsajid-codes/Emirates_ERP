package com.example.multi_tanent.crm.services;

import com.example.multi_tanent.config.TenantContext;
import com.example.multi_tanent.crm.dto.LeadSourceRequest;
import com.example.multi_tanent.crm.dto.LeadSourceResponse;
import com.example.multi_tanent.crm.entity.LeadSource;
import com.example.multi_tanent.crm.repository.LeadSourceRepository;
import com.example.multi_tanent.spersusers.enitity.Tenant;
import com.example.multi_tanent.spersusers.repository.TenantRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional("tenantTx")
public class LeadSourceService {

    private final LeadSourceRepository leadSourceRepository;
    private final TenantRepository tenantRepository;

    private Tenant getCurrentTenant() {
        String tenantId = TenantContext.getTenantId();
        return tenantRepository.findByTenantId(tenantId)
                .orElseThrow(() -> new IllegalStateException("Tenant not found: " + tenantId));
    }

    @Transactional(readOnly = true)
    public List<LeadSourceResponse> getAll() {
        Long tenantId = getCurrentTenant().getId();
        return leadSourceRepository.findByTenantIdOrderByNameAsc(tenantId)
                .stream()
                .map(LeadSourceResponse::fromEntity)
                .collect(Collectors.toList());
    }

    public LeadSourceResponse create(LeadSourceRequest request) {
        Tenant tenant = getCurrentTenant();
        LeadSource leadSource = new LeadSource();
        leadSource.setTenant(tenant);
        leadSource.setName(request.getName());
        return LeadSourceResponse.fromEntity(leadSourceRepository.save(leadSource));
    }

    public LeadSourceResponse update(Long id, LeadSourceRequest request) {
        Tenant tenant = getCurrentTenant();
        LeadSource leadSource = leadSourceRepository.findByTenantIdAndId(tenant.getId(), id)
                .orElseThrow(() -> new EntityNotFoundException("LeadSource not found with id: " + id));
        leadSource.setName(request.getName());
        return LeadSourceResponse.fromEntity(leadSourceRepository.save(leadSource));
    }

    public void delete(Long id) {
        Tenant tenant = getCurrentTenant();
        if (!leadSourceRepository.existsByTenantIdAndId(tenant.getId(), id)) {
            throw new EntityNotFoundException("LeadSource not found with id: " + id);
        }
        leadSourceRepository.deleteById(id);
    }
}