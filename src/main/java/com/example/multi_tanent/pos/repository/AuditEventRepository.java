package com.example.multi_tanent.pos.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.multi_tanent.pos.entity.AuditEvent;

import java.util.List;
import java.util.Optional;

public interface AuditEventRepository extends JpaRepository<AuditEvent, Long> {
    List<AuditEvent> findByTenantId(Long tenantId);
    Optional<AuditEvent> findByIdAndTenantId(Long id, Long tenantId);
}
