package com.example.multi_tanent.crm.entity;

import com.example.multi_tanent.spersusers.enitity.Location;
import com.example.multi_tanent.spersusers.enitity.Tenant;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "crm_lead_stages", uniqueConstraints = {
        @UniqueConstraint(columnNames = { "tenant_id", "name" })
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CrmLeadStage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "tenant_id", nullable = false)
    private Tenant tenant;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "location_id") // Optional relationship
    private Location location;

    @Column(nullable = false, name = "name")
    private String name;

    @Column(nullable = false, name = "sort_order")
    @Builder.Default
    private Integer sortOrder = 0;

    @Column(nullable = false, name = "is_default")
    @Builder.Default
    private boolean isDefault = false;

    // @Enumerated(EnumType.STRING)
    @Convert(converter = com.example.multi_tanent.crm.converters.CrmStageMoveToConverter.class)
    @Column(name = "move_to")
    private com.example.multi_tanent.crm.enums.CrmStageMoveTo moveTo;

    @Column(nullable = false, name = "is_converted")
    @Builder.Default
    private boolean isConverted = false;

    @Column(nullable = false, name = "is_won")
    @Builder.Default
    private boolean isWon = false;

    @Column(nullable = false, name = "is_mql")
    @Builder.Default
    private boolean isMql = false;

    @Column(nullable = false, name = "is_sql")
    @Builder.Default
    private boolean isSql = false;

    private Double probability;

    @Column(nullable = false, name = "assign_to")
    @Builder.Default
    private boolean assignTo = false;
}