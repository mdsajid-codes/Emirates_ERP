package com.example.multi_tanent.accounts.service.journal;

import com.example.multi_tanent.accounts.entity.journal.AuditLog;
import java.util.List;

public interface AuditLogService {
    void log(String action, String entityType, Long entityId, String changedBy, Object oldValue, Object newValue);
    List<AuditLog> getByEntity(String entityType, Long entityId);
    List<AuditLog> getByUser(String changedBy);
}
