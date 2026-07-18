package com.example.multi_tanent.accounts.repository.journal;

import com.example.multi_tanent.accounts.entity.journal.AuditLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AuditLogRepository extends JpaRepository<AuditLog, Long> {

    @Query("SELECT a FROM AuditLog a WHERE a.entityType = :entityType AND a.entityId = :entityId ORDER BY a.changeTimestamp DESC")
    List<AuditLog> findByEntityTypeAndEntityId(@Param("entityType") String entityType, @Param("entityId") Long entityId);

    @Query("SELECT a FROM AuditLog a WHERE a.changedBy = :changedBy ORDER BY a.changeTimestamp DESC")
    List<AuditLog> findByChangedBy(@Param("changedBy") String changedBy);
}
