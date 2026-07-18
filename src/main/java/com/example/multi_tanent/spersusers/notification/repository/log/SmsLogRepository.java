package com.example.multi_tanent.spersusers.notification.repository.log;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.multi_tanent.spersusers.enitity.notification.entity.log.SmsLog;

@Repository
public interface SmsLogRepository extends JpaRepository<SmsLog, Long> {
    Page<SmsLog> findByTenantId(Long tenantId, Pageable pageable);
}
