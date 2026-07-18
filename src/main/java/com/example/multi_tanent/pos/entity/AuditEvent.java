package com.example.multi_tanent.pos.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.OffsetDateTime;

import com.example.multi_tanent.spersusers.enitity.Tenant;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "audit_events")
public class AuditEvent {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "tenant_id")
    private Tenant tenant;

    @Column(name = "actor_id")
    private Long actorId; // optional user id who initiated

    @Column(name = "entity_type")
    private String entityType; // 'sale', 'product', 'stock_movement', etc.

    @Column(name = "entity_id")
    private Long entityId;

    private String action; // create, update, delete, refund, etc.

    @Lob
    @Column(columnDefinition = "text")
    private String payload; // JSON payload as string

    @Column(name = "created_at")
    private OffsetDateTime createdAt;

    @PrePersist
    public void prePersist() {
        if (createdAt == null)
            createdAt = OffsetDateTime.now();
    }
}