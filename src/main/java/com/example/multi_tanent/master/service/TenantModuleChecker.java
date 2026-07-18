package com.example.multi_tanent.master.service;

import com.example.multi_tanent.config.TenantContext;
import com.example.multi_tanent.master.entity.ServiceModule;
import com.example.multi_tanent.master.repository.MasterTenantRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class TenantModuleChecker {

    private final MasterTenantRepository masterTenantRepository;

    /**
     * Checks if the current tenant has the specified service module assigned.
     */
    public boolean hasModule(ServiceModule module) {
        String tenantId = TenantContext.getTenantId();
        if (tenantId == null || tenantId.isBlank()) {
            return false;
        }

        return masterTenantRepository.findByTenantId(tenantId)
                .map(tenant -> {
                    List<ServiceModule> modules = tenant.getServiceModules();
                    if (modules == null) {
                        return false;
                    }
                    return ServiceModule.resolveWithDependencies(modules).contains(module);
                })
                .orElse(false);
    }
}
