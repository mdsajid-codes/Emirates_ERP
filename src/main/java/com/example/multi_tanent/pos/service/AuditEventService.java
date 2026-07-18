package com.example.multi_tanent.pos.service;

import com.example.multi_tanent.pos.entity.AuditEvent;
import com.example.multi_tanent.pos.repository.AuditEventRepository;
import com.example.multi_tanent.spersusers.enitity.Tenant;
import com.example.multi_tanent.spersusers.repository.TenantRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@Transactional("tenantTx")
public class AuditEventService {

    private final AuditEventRepository auditEventRepository;
    private final TenantRepository tenantRepository;

    public AuditEventService(AuditEventRepository auditEventRepository, TenantRepository tenantRepository) {
        this.auditEventRepository = auditEventRepository;
        this.tenantRepository = tenantRepository;
    }

    private Tenant getCurrentTenant() {
        return tenantRepository.findFirstByOrderByIdAsc()
                .orElseThrow(() -> new IllegalStateException("Tenant context not found."));
    }

    // This method would be called by other services to log events
    public void createAuditEvent(Long actorId, String entityType, Long entityId, String action, String payload) {
        Tenant currentTenant = getCurrentTenant();
        AuditEvent event = AuditEvent.builder()
                .tenant(currentTenant)
                .actorId(actorId)
                .entityType(entityType)
                .entityId(entityId)
                .action(action)
                .payload(payload)
                .build();
        auditEventRepository.save(event);
    }

    @Transactional(readOnly = true)
    public List<AuditEvent> getAllAuditEventsForCurrentTenant() {
        Tenant currentTenant = getCurrentTenant();
        return auditEventRepository.findByTenantId(currentTenant.getId());
    }

    @Transactional(readOnly = true)
    public Optional<AuditEvent> getAuditEventById(Long id) {
        Tenant currentTenant = getCurrentTenant();
        return auditEventRepository.findByIdAndTenantId(id, currentTenant.getId());
    }
}