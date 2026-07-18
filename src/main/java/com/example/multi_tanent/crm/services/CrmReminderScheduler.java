package com.example.multi_tanent.crm.services;

import com.example.multi_tanent.config.TenantContext;
import com.example.multi_tanent.config.TenantRegistry;
import com.example.multi_tanent.master.entity.MasterTenant;
import com.example.multi_tanent.master.repository.MasterTenantRepository;
import com.example.multi_tanent.spersusers.repository.TenantRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class CrmReminderScheduler {

    private final CrmCalendarService calendarService;
    private final TenantRepository tenantRepository;
    private final MasterTenantRepository masterTenantRepository;
    private final TenantRegistry tenantRegistry;

    /**
     * Runs every 60 seconds to check and dispatch due reminders for all tenants.
     */
    @Scheduled(fixedDelay = 60000)
    public void runReminderDispatch() {
        log.debug("Starting scheduled CRM reminder dispatch job");
        
        // Fetch all master tenants - this hits the master DB and doesn't require a tenant context
        List<MasterTenant> masterTenants = masterTenantRepository.findAll();
        
        for (MasterTenant mt : masterTenants) {
            String tId = mt.getTenantId();
            
            // Check if the tenant's data source is actually registered and active
            if (!tenantRegistry.asTargetMap().containsKey(tId)) {
                log.warn("Skipping reminder dispatch for tenant '{}': Data source not registered in registry.", tId);
                continue;
            }

            try {
                // Set the tenant context for the current thread
                TenantContext.setTenantId(tId);
                
                // Find the local tenant representation in the routed database to get its primary key ID
                tenantRepository.findByTenantId(tId).ifPresent(localTenant -> {
                    calendarService.dispatchDueReminders(localTenant.getId());
                });
                
            } catch (Exception e) {
                log.error("Error dispatching reminders for tenant: {}", tId, e);
            } finally {
                // Always clear the context after processing each tenant
                TenantContext.clear();
            }
        }
    }
}
