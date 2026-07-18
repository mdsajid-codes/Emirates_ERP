package com.example.multi_tanent.accounts.service.journal;

import com.example.multi_tanent.accounts.entity.journal.AuditLog;
import com.example.multi_tanent.accounts.repository.journal.AuditLogRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.SneakyThrows;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional("tenantTx")
public class AuditLogServiceImpl implements AuditLogService {

    private final AuditLogRepository auditLogRepository;
    private final ObjectMapper objectMapper;

    @SneakyThrows
    private String toJson(Object obj) {
        if (obj == null) return null;
        if (obj instanceof String) return (String) obj;
        return objectMapper.writeValueAsString(obj);
    }

    @Override
    public void log(String action, String entityType, Long entityId, String changedBy, Object oldValue, Object newValue) {
        AuditLog log = AuditLog.builder()
                .action(action)
                .entityType(entityType)
                .entityId(entityId)
                .changedBy(changedBy)
                .changeTimestamp(LocalDateTime.now())
                .oldValue(toJson(oldValue))
                .newValue(toJson(newValue))
                .build();
        auditLogRepository.save(log);
    }

    @Override
    public List<AuditLog> getByEntity(String entityType, Long entityId) {
        return auditLogRepository.findByEntityTypeAndEntityId(entityType, entityId);
    }

    @Override
    public List<AuditLog> getByUser(String changedBy) {
        return auditLogRepository.findByChangedBy(changedBy);
    }
}
