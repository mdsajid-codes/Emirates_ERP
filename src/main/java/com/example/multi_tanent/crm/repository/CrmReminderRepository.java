package com.example.multi_tanent.crm.repository;

import com.example.multi_tanent.crm.entity.CrmReminder;
import com.example.multi_tanent.crm.enums.CrmEntityType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface CrmReminderRepository extends JpaRepository<CrmReminder, Long> {

    List<CrmReminder> findByTenantIdOrderByRemindAtAsc(Long tenantId);

    Optional<CrmReminder> findByIdAndTenantId(Long id, Long tenantId);

    @Query("SELECT r FROM CrmReminder r WHERE r.tenant.id = :tenantId " +
           "AND r.remindAt <= :cutoff " +
           "AND r.dismissed = false")
    List<CrmReminder> findDueReminders(@Param("tenantId") Long tenantId, 
                                       @Param("cutoff") LocalDateTime cutoff);

    Optional<CrmReminder> findByEntityTypeAndEntityIdAndTenantId(CrmEntityType entityType, Long entityId, Long tenantId);

    List<CrmReminder> findByTenantIdAndDismissedFalseAndRemindAtBetween(Long tenantId, LocalDateTime start, LocalDateTime end);
}
