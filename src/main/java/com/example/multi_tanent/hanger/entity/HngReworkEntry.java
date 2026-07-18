package com.example.multi_tanent.hanger.entity;

import com.example.multi_tanent.hanger.enums.BatchStage;
import com.example.multi_tanent.hanger.enums.ReworkStatus;
import com.example.multi_tanent.spersusers.enitity.Employee;
import com.example.multi_tanent.spersusers.enitity.Tenant;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.OffsetDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "hng_rework_entry")
public class HngReworkEntry {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "tenant_id", nullable = false)
    private Tenant tenant;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "batch_id", nullable = false)
    private HngProductionBatch batch;

    @Column(name = "rework_no", nullable = false, length = 50)
    private String reworkNo;

    @Enumerated(EnumType.STRING)
    @Column(name = "source_stage", nullable = false, length = 30)
    private BatchStage sourceStage;

    @Enumerated(EnumType.STRING)
    @Column(name = "target_stage", nullable = false, length = 30)
    private BatchStage targetStage;

    @Column(name = "rework_qty", nullable = false)
    private Integer reworkQty;

    @Column(name = "reason", length = 255)
    private String reason;

    @Column(name = "remarks", columnDefinition = "TEXT")
    private String remarks;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", length = 30)
    private ReworkStatus status;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assigned_to_id")
    private Employee assignedTo;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private OffsetDateTime createdAt;
}
