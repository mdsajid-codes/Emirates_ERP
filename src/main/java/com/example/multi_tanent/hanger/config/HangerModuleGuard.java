package com.example.multi_tanent.hanger.config;

import com.example.multi_tanent.config.TenantContext;
import com.example.multi_tanent.master.entity.ServiceModule;
import com.example.multi_tanent.master.repository.MasterTenantRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

/**
 * Spring Security expression bean that checks whether the current tenant
 * has the HANGER_MANUFACTURING module enabled.
 *
 * Used by @RequiresHangerModule annotation via:
 * @PreAuthorize("@hangerModuleGuard.check()")
 *
 * Any tenant NOT assigned HANGER_MANUFACTURING will get 403 Forbidden
 * on all /api/hanger/** endpoints.
 */
@Slf4j
@Component("hangerModuleGuard")
@RequiredArgsConstructor
public class HangerModuleGuard {

    private final MasterTenantRepository masterTenantRepository;

    /**
     * Returns true if the authenticated tenant's service_modules JSON list
     * contains HANGER_MANUFACTURING.
     */
    public boolean check() {
        String tenantId = TenantContext.getTenantId();
        if (tenantId == null || tenantId.isBlank()) {
            log.warn("HangerModuleGuard: no tenantId in context");
            return false;
        }

        return masterTenantRepository.findByTenantId(tenantId)
                .map(tenant -> {
                    java.util.List<ServiceModule> modules = tenant.getServiceModules();
                    return modules != null && modules.contains(ServiceModule.HANGER_MANUFACTURING);
                })
                .orElse(false);
    }
}
