package com.example.multi_tanent.crm.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import java.time.OffsetDateTime;

@Entity
@Table(name = "crm_audit_logs", indexes = {
    @Index(name = "idx_audit_tenant_entity", columnList = "tenant_id,entity_type,performed_at")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CrmAuditLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "tenant_id", nullable = false)
    private Long tenantId;

    @Column(name = "employee_id")
    private Long employeeId;

    @Column(name = "performed_by_email", length = 255)
    private String performedByEmail;

    @Column(name = "action", nullable = false, length = 100)
    private String action;

    @Column(name = "entity_type", nullable = false, length = 50)
    private String entityType;

    @Column(name = "entity_id")
    private Long entityId;

    @Column(name = "description", length = 2000)
    private String description;

    @CreationTimestamp
    @Column(name = "performed_at", nullable = false, updatable = false)
    private OffsetDateTime performedAt;
}
