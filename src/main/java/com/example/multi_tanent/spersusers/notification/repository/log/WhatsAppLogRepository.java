package com.example.multi_tanent.spersusers.notification.repository.log;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.multi_tanent.spersusers.enitity.notification.entity.log.WhatsAppLog;

@Repository
public interface WhatsAppLogRepository extends JpaRepository<WhatsAppLog, Long> {
    Page<WhatsAppLog> findByTenantId(Long tenantId, Pageable pageable);
}
