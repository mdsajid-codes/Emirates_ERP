package com.example.multi_tanent.production.entity;

import com.example.multi_tanent.spersusers.enitity.Location;
import com.example.multi_tanent.spersusers.enitity.Tenant;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "process_semi_finished")
public class ProcessSemiFinished {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "tenant_id", nullable = false)
    private Tenant tenant;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "location_id")
    private Location location;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "item_id", nullable = false)
    private ProSemifinished item;

    @Column(name = "process_flow_name", nullable = false)
    private String processFlowName;

    @Column(name = "other_fixed_cost", precision = 19, scale = 4)
    @Builder.Default
    private BigDecimal otherFixedCost = BigDecimal.ZERO;

    @Column(name = "other_variable_cost", precision = 19, scale = 4)
    @Builder.Default
    private BigDecimal otherVariableCost = BigDecimal.ZERO;

    @Column(name = "is_locked")
    @Builder.Default
    private boolean isLocked = false;

    @OneToMany(mappedBy = "processSemiFinished", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("sequence ASC")
    @Builder.Default
    private List<ProcessSemiFinishedDetail> details = new ArrayList<>();

    @CreationTimestamp
    @Column(updatable = false, name = "created_at")
    private OffsetDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private OffsetDateTime updatedAt;
}
