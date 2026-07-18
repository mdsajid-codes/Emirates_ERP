package com.example.multi_tanent.crm.services;

import com.example.multi_tanent.config.TenantContext;
import com.example.multi_tanent.crm.entity.CrmAuditLog;
import com.example.multi_tanent.crm.repository.CrmAuditLogRepository;
import com.example.multi_tanent.spersusers.enitity.Tenant;
import com.example.multi_tanent.spersusers.repository.TenantRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class CrmAuditService {

    private final CrmAuditLogRepository auditLogRepository;
    private final TenantRepository tenantRepository;
    private final CrmAccessService crmAccessService;

    /**
     * Records a CRM audit event safely. If any exception occurs during DB operations,
     * it logs a warning instead of failing the parent transaction.
     */
    public void log(String action, String entityType, Long entityId, String description) {
        try {
            String tenantId = TenantContext.getTenantId();
            if (tenantId == null) {
                return;
            }
            Tenant tenant = tenantRepository.findByTenantId(tenantId).orElse(null);
            if (tenant == null) {
                return;
            }

            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            String email = (auth != null && auth.isAuthenticated()) ? auth.getName() : "SYSTEM";

            Long employeeId = null;
            try {
                employeeId = crmAccessService.getCurrentEmployeeId();
            } catch (Exception e) {
                // Ignore if security context isn't fully set up for current employee fetch (e.g. system tasks)
            }

            CrmAuditLog logEntry = CrmAuditLog.builder()
                    .tenantId(tenant.getId())
                    .employeeId(employeeId)
                    .performedByEmail(email)
                    .action(action)
                    .entityType(entityType)
                    .entityId(entityId)
                    .description(description)
                    .build();

            auditLogRepository.save(logEntry);
        } catch (Exception e) {
            log.warn("CRM Audit logging failed: {}", e.getMessage());
        }
    }
}
